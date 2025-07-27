import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// Like comment
router.patch('/:comment/like', verifyToken, async (req, res) => {
  const commentId = req.params.comment;
  const comment = await Comment.findById(commentId);
  const userId = req.user._id;

  if (!comment) return res.status(404).json({message: "Comment not found"});

  const hasLiked = comment.likes.includes(userId);

  if (!hasLiked) comment.likes.push(userId);
  else comment.likes.pull(userId);

  await comment.save();
  res.json({ likes: comment.likes.length, liked: !hasLiked });
})

// Delete comment
router.delete('/:comment', verifyToken, async (req, res) => {
  const commentId = req.params.comment;
  try {
    await Comment.findByIdAndUpdate(commentId, {author: null, text: "<deleted>"});
    res.json({message: "Comment deleted"})
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

export default router;