import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import fs from 'fs/promises';
import Notification from '../models/Notification.js';
import { NotificationContext, NotificationType } from '../../shared.js';
import User from '../models/User.js';
import { formatComment } from '../tools/formater.js';
import mongoose from 'mongoose';
import { validateComment } from '../../validate.js';

const router = express.Router();

// Comment
router.post('/', verifyToken, async (req, res) => {
  try {
    const parentId = req.body.parent;
    if (!mongoose.Types.ObjectId.isValid(parentId)) return res.status(400).json({message: "Invalid parent"});

    const validated = validateComment(req.body.text);
    if (validated) return res.status(400).json({ message: validated });

    const user = await User.findById(req.user._id);
    user.commentTimes = getTimes(user.commentTimes);
    if (user.commentTimes.length > 60) return res.status(400).json({message: "You can only comment up to 60 times per half an hour."})
    await user.save();

    const newComment = new Comment({ author: req.user._id, text: req.body.text.trim(), parent: parentId, mentions: req.body.mentions  });
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

    notifyMentionedInComments(saveComment.mentions, postParent._id, postParent.author._id);

    res.status(201).json(await formatComment(saveComment));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

const notifyMentionedInComments = (mentions, postId, postAuthorId) => {
  if (!mentions) return;
  mentions.forEach(async (mention) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(mention)) return;
      const mentioned = await User.findById(mention).select('notifications');
      if (!mentioned.notifications[NotificationType.COMMENT_MENTION]) return
      const exists = await Notification.exists({ for: mention, type: NotificationType.COMMENT_MENTION, [`context.${NotificationContext.POST_ID}`]: postId });
      if (exists) {
        const notif = await Notification.findOne({ for: mention, type: NotificationType.COMMENT_MENTION, [`context.${NotificationContext.POST_ID}`]: postId });
        notif.context[NotificationContext.MENTION_NUM] = Number(notif.context[NotificationContext.MENTION_NUM]) + 1;
        await notif.save();
      } else {
        const notif = new Notification({ for: mention, type: NotificationType.COMMENT_MENTION, context: [postId, 1, postAuthorId] });
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

// Like comment
router.patch('/:comment/like', verifyToken, async (req, res) => {
  const commentId = req.params.comment;
  if (!mongoose.Types.ObjectId.isValid(commentId)) return res.status(400).json({message: "Invalid comment id"});
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
  if (!mongoose.Types.ObjectId.isValid(commentId)) return res.status(400).json({message: "Invalid comment id"});
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
    if (!mongoose.Types.ObjectId.isValid(commentId)) return res.status(400).json({message: "Invalid comment id"});
    const comment = await Comment.findById(commentId).select('parent');
    if (!comment) return res.json({pinnedTree: []});
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