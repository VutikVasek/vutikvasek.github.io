import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import fs from 'fs/promises';
import Notification from '../models/Notification.js';
import { NotificationContext, NotificationType } from '../../shared.js';

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
    const replies = await Comment.exists({ parent: commentId })
    let comment;
    if (replies) comment = await Comment.findByIdAndUpdate(commentId, {author: null, text: "<deleted comment>"});
    else comment = await Comment.findByIdAndDelete(commentId);

    const img = `media/image/${commentId}0.webp`;
    try {
        await fs.access(img);
        await fs.unlink(img);
    } catch (err) {
      if (err.code !== 'ENOENT') console.log(err);
    }

    const parent = await Post.findById(comment.parent).select('author') || await Comment.findById(comment.parent).select('author');

    if (parent)
      await Notification.deleteOne({ for: parent.author, type: NotificationType.NEW_REPLY, [`context.${NotificationContext.COMMENT_ID}`]: comment._id });

    res.json({message: "Comment deleted"})
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

// Get pinned tree
router.get('/:comment/tree', async (req, res) => {
  try {
    const commentId = req.params.comment;
    const comment = await Comment.findById(commentId).select('parent');
    const parent = comment.parent;

    let pinnedTree = [commentId];

    const postParent = await Post.findById(parent);
    if (!postParent) {
      let commentParent = await Comment.findById(parent).select('parent');
      while (commentParent) {
        pinnedTree.push(commentParent._id);
        commentParent = await Comment.findById(commentParent.parent).select('parent');
      }
    }
    
    res.json({pinnedTree});
  } catch (err) {
    res.status(500).json({message: "Server error"});
    console.log(err);
  }
})

export default router;