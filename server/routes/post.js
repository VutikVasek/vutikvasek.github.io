import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { formatComment, formatDate, formatPopularComment, formatPost } from '../tools/formater.js';
import mongoose, { Types } from 'mongoose';
import fs from 'fs/promises';
import User from '../models/User.js';
import { GroupNotification, NotificationContext, NotificationType } from '../../shared.js';
import Notification from '../models/Notification.js';
import Follow from '../models/Follow.js';
import Group from '../models/Group.js';
import { notify, userValidFor } from './group.js';
import { validatePost } from '../../validate.js';

const router = express.Router();

// Post
router.post('/', verifyToken, async (req, res) => {
  try {
    const validated = validatePost(req.body.text);
    if (validated) return res.status(400).json({ message: validated });

    const user = await User.findById(req.user._id);
    user.postTimes = getTimes(user.postTimes);
    if (user.postTimes.length > 30) return res.status(400).json({message: "You can only post up to 30 times per half an hour."})
    await user.save();

    const replyingTo = mongoose.Types.ObjectId.isValid(req.body.replyingTo) ? req.body.replyingTo : undefined;
    const replyingToPost = await Post.findById(replyingTo).select('groups');

    const groups = await Group.find({ _id: { $in: req.body.groups?.filter(group => mongoose.Types.ObjectId.isValid(group)) } }).select('members admins everyoneCanPost');
    if (groups && groups.length === 0 && req.body.groups?.length > 0) return res.status(400).json({ message: "When posting on groups, you need to have at least one valid group" });
    const allGroups = groups?.filter(group => group.members.includes(req.user._id) && (group.everyoneCanPost || group.admins.includes(req.user._id)));

    if (replyingToPost) {
      const replyingToGroups = await Group.find({ _id: { $in: replyingToPost.groups } }).select('members admins everyoneCanPost');
      const replyingToMyGroups = replyingToGroups?.filter(group => group.members.includes(req.user._id) && (group.everyoneCanPost || group.admins.includes(req.user._id)));
      if (replyingToMyGroups.length < replyingToGroups.length) return res.status(400).json({ message: "You cannot reply to this post (you cannot post on all of the tagged groups)" });
      allGroups.push(...replyingToMyGroups);
    }

    const filteredGroups = allGroups?.reduce((acc, curr) => {
      if (!acc.find(group => group._id === curr._id)) acc.push(curr);
      return acc
    }, []);

    const newPost = new Post({ 
      author: req.user._id, 
      text: req.body.text.trim(),
      mentions: req.body.mentions?.filter(val => val.trim() !== '').filter((val, index, array) => array.indexOf(val) === index),
      groups: filteredGroups.map(group => group._id), 
      replyingTo: replyingTo });
    const savedPost = await newPost.save();

    notifyFollowers(savedPost._id, req.user._id);
    notifyMentioned(savedPost.mentions, savedPost._id, req.user._id);
    notifyGroupsMembers(filteredGroups, savedPost._id, req.user._id);

    res.status(201).json(savedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.messege });
  }
});

const getTimes = (times) => {
  const halfAnHourAgo = new Date();
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);
  return [...times, new Date()].filter(val => val > halfAnHourAgo);
}

const notifyFollowers = async (postId, userId) => {
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

const notifyGroupsMembers = async (groups, postId, userId) => {
  try {
    if (!groups) return;
    const valid = await Promise.all(groups.map(async (group, i) => {
        const filtered = await filterGroup(group);
        return filtered;
    }));
    const reduced = valid.reduce((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);
    
    reduced.filter((memberId, index, arr) => arr.indexOf(memberId) === index)
      .forEach(async memberId => {
        const notif = new Notification({ for: memberId, type: NotificationType.GROUP_POST, context: [postId, userId]});
        await notif.save();
      });
  } catch (err) {
    console.log(err);
  }
}

const filterGroup = async group => {
  const filtered = [];
  await Promise.all(group.members.map(async memberId => {
    const isValid = await userValidFor(memberId, group._id, GroupNotification.ALL);
    if (isValid) filtered.push(memberId);
    return isValid;
  }));
  return filtered;
}

// Get post
router.get('/:post', verifyTokenNotStrict, async (req, res) => {
  const postId = req.params.post;
  if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({message: "Invalid post id"});

  const unpost = await Post.findById(postId);
  if (!unpost) return res.status(404).json({message: "Post not found"});

  res.json(await formatPost(unpost, req.user?._id));
})

// Like post
router.patch('/:post/like', verifyToken, async (req, res) => {
  try {
    const postId = req.params.post;
    if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({ message: "Invalid post id" });
    const post = await Post.findById(postId);
    const userId = req.user._id;

    if (!post) return res.status(404).json({message: "Post not found"});

    const hasLiked = post.likes.includes(userId);

    if (!hasLiked) post.likes.push(userId);
    else post.likes.pull(userId);

    await post.save();
    res.json({ likes: post.likes.length, liked: !hasLiked });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error"})
  }
})

// Delete post
router.delete('/:post', verifyToken, async (req, res) => {
  const postId = req.params.post;
  if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({message: "Invalid post id"});
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

// Get groups
router.get('/:id/groups', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid post id" })
  const post = await Post.findById(req.params.id).select('groups');
  const groups = await Group.find({ _id: { $in: post.groups } }).select('name');
  res.json(groups.map(group => group.name));
})

// Get comments
router.get('/:id/comments', verifyTokenNotStrict, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({message: "Invalid post id"});
  getComments(req, res, { parent: new Types.ObjectId(req.params.id) });
})

export const getComments = async (req, res, filter) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const skip = (page - 1) * limit;
  const sortByPopularity = req.query.sort?.trim() == "popular";
  const time = req.query.time?.trim();
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
  if (!pinnedId || !mongoose.Types.ObjectId.isValid(pinnedId)) return await Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const pinned = await Comment.findById(pinnedId);
  const comments = await Comment.find({ ...filter, _id: { $ne: pinnedId } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return [pinned, ...comments];
}

export default router;