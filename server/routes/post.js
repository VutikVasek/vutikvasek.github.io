import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { formatComment, formatDate, formatPopularComment, formatPost } from '../tools/formater.js';
import { Types } from 'mongoose';
import fs from 'fs/promises';
import User from '../models/User.js';
import { NotificationType } from '../../shared.js';
import Notification from '../models/Notification.js';
import Follow from '../models/Follow.js';

const router = express.Router();

// Post
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.postTimes = getTimes(user.postTimes);
    if (user.postTimes.length > 30) return res.status(400).json({message: "You can only post up to 30 times per half an hour."})
    await user.save();

    const newPost = new Post({ author: req.user._id, text: req.body.text.trim(), mentions: req.body.mentions });
    const savedPost = await newPost.save();

    notifyFollowers(req.user._id, savedPost._id);

    res.status(201).json(savedPost);
  } catch (err) {
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

// Comment
router.post('/comment/', verifyToken, async (req, res) => {
  try {
    const parentId = req.body.parent;

    const user = await User.findById(req.user._id);
    user.commentTimes = getTimes(user.commentTimes);
    if (user.commentTimes.length > 60) return res.status(400).json({message: "You can only comment up to 60 times per half an hour."})
    await user.save();

    const newComment = new Comment({ author: req.user._id, text: req.body.text.trim(), parent: parentId });
    const saveComment = await newComment.save();

    
    let postParent = await Post.findById(parentId).select('author').populate('author', 'notifications _id');
    let diretctParent = postParent;
    if (!postParent) {
      let commentParent = await Comment.findById(parentId).select('parent author').populate('author', 'notifications _id');
      diretctParent = commentParent;
      
      while (commentParent) {
        const next = await Comment.findById(commentParent.parent).select('parent');
        if (!next) break;
        commentParent = next;
      }

      postParent = await Post.findById(commentParent.parent).select('author').populate('author', 'notifications _id');
    }

    if (diretctParent?.author?.notifications[NotificationType.NEW_REPLY]) {
      const notif = new Notification({ for: diretctParent.author._id, type: NotificationType.NEW_REPLY, context: [postParent._id, newComment._id] });
      await notif.save();
    }

    res.status(201).json(await formatComment(saveComment));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

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

const getTimes = (times) => {
  const halfAnHourAgo = new Date();
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);
  return [...times, new Date()].filter(val => val > halfAnHourAgo);
}

const getUncomments = async (filter, pinnedId, skip, limit) => {
  if (!pinnedId) return await Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const pinned = await Comment.findById(pinnedId);
  const comments = await Comment.find({ ...filter, _id: { $ne: pinnedId } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return [pinned, ...comments];
}

export default router;