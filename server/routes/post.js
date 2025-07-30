import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { formatComment, formatDate, formatPopularComment, formatPost } from '../tools/formater.js';
import { Types } from 'mongoose';
import fs from 'fs/promises';
import User from '../models/User.js';

const router = express.Router();

// Post
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.postTimes = getTimes(user.postTimes);
    if (user.postTimes.length > 30) return res.status(400).json({message: "You can only post up to 30 times per half an hour."})
    await user.save();

    const newPost = new Post({ author: req.user._id, text: req.body.text.trim() });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.messege });
  }
});

// Comment
router.post('/comment/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.commentTimes = getTimes(user.commentTimes);
    if (user.commentTimes.length > 60) return res.status(400).json({message: "You can only comment up to 60 times per half an hour."})
    await user.save();

    const newComment = new Comment({ author: req.user._id, text: req.body.text.trim(), parent: req.body.parent });
    const saveComment = await newComment.save();
    res.status(201).json(await formatComment(saveComment));
  } catch (err) {
    res.status(500).json({ message: err.messege });
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
    await Post.findByIdAndDelete(postId);
    try {
      const path = `media/image/${postId}`;
      const img1 = path + "0.webp";
      const img2 = path + "1.webp";
      await fs.access(img1);
      await fs.unlink(img1);
      await fs.access(img2);
      await fs.unlink(img2);
    } catch (err) {
      if (err.code !== 'ENOENT') console.log(err);
    }
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
  if (sortByPopularity && time != "all") filter = {...filter, createdAt: {$gt: formatDate(time)}};
  
  try {
    if (!sortByPopularity) {
      const comments = await Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

export default router;