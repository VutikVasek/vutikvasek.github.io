import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { formatComment, formatDate, formatPopularComment, formatPost } from '../tools/formater.js';
import mongoose, { Types } from 'mongoose';
import fs from 'fs/promises';
import User from '../models/User.js';
import { NotificationContext, NotificationType } from '../../shared.js';
import Notification from '../models/Notification.js';
import Follow from '../models/Follow.js';
import Group from '../models/Group.js';

const router = express.Router();

// Post
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.postTimes = getTimes(user.postTimes);
    if (user.postTimes.length > 30) return res.status(400).json({message: "You can only post up to 30 times per half an hour."})
    await user.save();

    const groups = await Group.find({ _id: { $in: req.body.groups.filter(group => mongoose.Types.ObjectId.isValid(group)) } }).select('members admins');
    if (groups && groups.length === 0) return res.status(400).json({ message: "When posting on groups, you need to have at least one valid group" });
    const mygroups = groups?.filter(group => group.members.includes(req.user._id) && (group.everyoneCanPost || group.admins.includes(req.user._id)));

    const newPost = new Post({ author: req.user._id, text: req.body.text.trim(), groups: mygroups?.map(group => group._id),
      mentions: req.body.mentions?.filter(val => val.trim() !== '').filter((val, index, array) => array.indexOf(val) === index) });
    const savedPost = await newPost.save();

    notifyFollowers(req.user._id, savedPost._id);
    notifyMentioned(savedPost.mentions, savedPost._id, req.user._id);

    res.status(201).json(savedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.messege });
  }
});

const notifyFollowers = async (userId, postId) => {
    const followers = await Follow.find({ following: userId, notify: true });
    followers.forEach(async (follow) => {
      try {
          const follower = await User.findById(follow.follower).select('notifications');
          if (follower.notifications[NotificationType.NEW_POST]) {
            const notif = new Notification({for: follow.follower, type: NotificationType.NEW_POST, context: [postId, userId] });
            await notif.save();
          }
      } catch (err) {
        console.log(err);
      }
    })
}

const getTimes = (times) => {
  const halfAnHourAgo = new Date();
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);
  return [...times, new Date()].filter(val => val > halfAnHourAgo);
}

const notifyMentioned = (mentions, postId, userId) => {
  if (!mentions) return;
  mentions.forEach(async (mention) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(mention)) return;
      const mentioned = await User.findById(mention).select('notifications');
      if (mentioned.notifications[NotificationType.MENTION]) {
        const notif = new Notification({ for: mention, type: NotificationType.MENTION, context: [postId, userId] });
        await notif.save();
      }
    } catch (err) {
      console.log(err);
    }
  })
}

// Like post
router.patch('/:post/like', verifyToken, async (req, res) => {
  const postId = req.params.post;
  const post = await Post.findById(postId);
  const userId = req.user._id;

  if (!post) return res.status(404).json({message: "Post not found"});

  const hasLiked = post.likes.includes(userId);

  if (!hasLiked) post.likes.push(userId);
  else post.likes.pull(userId);

  await post.save();
  res.json({ likes: post.likes.length, liked: !hasLiked });
})

// Get post
router.get('/:post', verifyTokenNotStrict, async (req, res) => {
  const postId = req.params.post;

  const unpost = await Post.findById(postId);
  if (!unpost) return res.status(404).json({message: "Post not found"});

  res.json(await formatPost(unpost, req.user?._id));
})

// Delete post
router.delete('/:post', verifyToken, async (req, res) => {
  const postId = req.params.post;
  try {
    const post = await Post.findByIdAndDelete(postId);
    const path = `media/image/${postId}`;
    await Promise.all([0, 1].map(async num => {
      const img = path + num + ".webp";
      try {
          await fs.access(img);
          await fs.unlink(img);
      } catch (err) {
        if (err.code !== 'ENOENT') console.log(err);
      }
    }))
    await Notification.deleteMany({ [`context.${NotificationContext.POST_ID}`]: postId });
    res.json({message: "Post deleted"})
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
});

// Get comments
router.get('/:id/comments', verifyTokenNotStrict, async (req, res) => {
  getComments(req, res, { parent: new Types.ObjectId(req.params.id) });
})

export const getComments = async (req, res, filter) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const skip = (page - 1) * limit;
  const sortByPopularity = req.query.sort == "popular";
  const time = req.query.time;
  const linkParent = req.query.link;
  const pinnedId = req.query.pinned;
  if (sortByPopularity && time != "all") filter = {...filter, createdAt: {$gt: formatDate(time)}};
  
  try {
    if (!sortByPopularity) {
      const comments = await getUncomments(filter, pinnedId, skip, limit);
      const total = await Comment.countDocuments(filter);
      
      const commentsWithAuthors = await Promise.all(
        comments.map(async (uncomment) => await formatComment(uncomment, req.user?._id, linkParent))
      );

      res.json({
        comments: commentsWithAuthors,
        hasMore: skip + comments.length < total,
      });
    } else {
      const comments = await Comment.aggregate([
        { $match: filter },
        { $addFields: {
            likesCount: { $size: { $ifNull: ["$likes", []] } }
          }
        },
        { $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author"
          }
        },
        { $addFields: {
            author: {
              $cond: {
                if: { $gt: [{ $size: "$author" }, 0] },
                then: {
                  _id: { $arrayElemAt: ["$author._id", 0] },
                  username: { $arrayElemAt: ["$author.username", 0] }
                },
                else: {
                  _id: "<deleted>",
                  username: "<deleted>"
                }
              }
            }
          }
        },
        { $unwind: "$author" },
        { $sort:  { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
  
      const total = await Comment.countDocuments(filter);
      
      const commentsWithAuthors = await Promise.all(
        comments.map(async (unpost) => await formatPopularComment(unpost, req.user?._id, linkParent))
      );
  
      res.json({
        comments: commentsWithAuthors,
        hasMore: skip + comments.length < total,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
}

const getUncomments = async (filter, pinnedId, skip, limit) => {
  if (!pinnedId) return await Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const pinned = await Comment.findById(pinnedId);
  const comments = await Comment.find({ ...filter, _id: { $ne: pinnedId } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return [pinned, ...comments];
}

export default router;