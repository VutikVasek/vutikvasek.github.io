import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import { NotificationContext, NotificationType } from '../../shared.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const notifications = await Notification.find({ for: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Notification.countDocuments({ for: req.user._id });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    await Notification.deleteMany({ for: req.user._id, createdAt: { $lt: monthAgo } });

    const formated = await Promise.all(notifications.map(async notif => {
      const notification = notif.toObject();
      notif.seen = true;
      await notif.save();
      switch (notification.type) {
        case NotificationType.NEW_FOLLOWER:
          notification.author = (await User.findById(notification.context[NotificationContext.FOLLOWER_ID]).select('username')).username;
          notification.pfp = notification.context[NotificationContext.FOLLOWER_ID];
          break;
        case NotificationType.NEW_REPLY:
          const comment = await Comment.findById(notification.context[NotificationContext.COMMENT_ID]).select('author parent').populate('author', 'username');
          const postParent = await Post.findById(comment.parent);
          notification.author = comment?.author?.username || "<deleted>";
          notification.reply = !postParent;
          notification.pfp = comment?.author?._id;
          break;
        case NotificationType.NEW_POST:
          notification.author = (await User.findById(notification.context[NotificationContext.FOLLOWING_ID]).select('username')).username;
          notification.pfp = notification.context[NotificationContext.FOLLOWING_ID];
          break;
      }
      return notification;
    }))
    res.json({
      notifications: formated,
      hasMore: skip + notifications.length < total
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  const notificationId = req.params.id;
  try {
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: "Notification cleared"});
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
});

export default router;