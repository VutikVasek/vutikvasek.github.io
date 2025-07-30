import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import { NotificationType } from '../../shared.js';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ for: req.user._id }).sort({ createdAt: -1 });
    const formated = await Promise.all(notifications.map(async notif => {
      const notification = notif.toObject();
      switch (notification.type) {
        case NotificationType.NEW_FOLLOWER:
          break;
        case NotificationType.NEW_REPLY:
          const comment = await Comment.findById(notification.context[1]).select('author parent').populate('author', 'username');
          const postParent = await Post.findById(comment.parent);
          notification.author = comment?.author?.username || "<deleted>";
          notification.reply = !postParent;
      }
      return notification;
    }))
    res.json({notifications: formated});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;