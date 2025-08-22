import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import { GroupNotification, NotificationContext, NotificationType } from '../../shared.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { userValidFor } from './group.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    await Notification.deleteMany({ for: req.user._id, createdAt: { $lt: monthAgo } });
    
    const notifications = await Notification.find({ for: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Notification.countDocuments({ for: req.user._id });

    const formated = await Promise.all(notifications.map(async notif => {
      let notification = notif.toObject();
      if (!notif.seen) { 
        notif.seen = true;
        await notif.save();
      }
      switch (notification.type) {
        case NotificationType.NEW_FOLLOWER:
          notification.author = (await User.findById(notification.context[NotificationContext.FOLLOWER_ID]).select('username'))?.username ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.FOLLOWER_ID];
          break;
        case NotificationType.NEW_REPLY:
          const comment = await Comment.findById(notification.context[NotificationContext.COMMENT_ID]).select('author parent').populate('author', 'username');
          const postParent = await Post.findById(comment?.parent);
          notification.author = comment?.author?.username || "<deleted>";
          notification.reply = !postParent;
          notification.pfp = comment?.author?._id;
          break;
        case NotificationType.NEW_POST:
          notification.author = (await User.findById(notification.context[NotificationContext.FOLLOWING_ID]).select('username'))?.username ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.FOLLOWING_ID];
          break;
        case NotificationType.MENTION:
          notification.author = (await User.findById(notification.context[NotificationContext.MENTIONER_ID]).select('username'))?.username ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.MENTIONER_ID];
          break;
        case NotificationType.COMMENT_MENTION:
          notification.author = (await User.findById(notification.context[NotificationContext.POST_AUTHOR_ID]).select('username'))?.username ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.POST_AUTHOR_ID];
          break;
        case NotificationType.NEW_MEMBER:
          notification.username = (await User.findById(notification.context[NotificationContext.MEMBER_ID]).select('username'))?.username ?? "<deleted>";
          notification.groupname = (await Group.findById(notification.context[NotificationContext.GROUP_ID]).select('name'))?.name ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.MEMBER_ID];
          break;
        case NotificationType.GROUP_JOIN_REQUEST:
          notification.username = (await User.findById(notification.context[NotificationContext.MEMBER_ID]).select('username'))?.username ?? "<deleted>";
          notification.groupname = (await Group.findById(notification.context[NotificationContext.GROUP_ID]).select('name'))?.name ?? "<deleted>";
          notification.pfp = notification.context[NotificationContext.MEMBER_ID];
          break;
        case NotificationType.GROUP_JOIN_ACCEPT: 
        case NotificationType.GROUP_JOIN_DENY:
        case NotificationType.MADE_ADMIN: 
        case NotificationType.REVOKED_ADMIN:
          notification.groupname = (await Group.findById(notification.context[NotificationContext.GROUP_ID]).select('name'))?.name ?? "<deleted>";
          notification.gp = notification.context[NotificationContext.GROUP_ID];
          break;
        case NotificationType.GROUP_POST:
          notification.author = (await User.findById(notification.context[NotificationContext.MEMBER_ID]).select('username'))?.username ?? "<deleted>";
          const postGroups = (await Post.findById(notification.context[NotificationContext.POST_ID]).select('groups')).groups;
          const groups = await Group.find({_id: { $in: postGroups }, members: req.user._id}).select('name');
          let myGroups = [];
          await Promise.all(groups.map(async group => {
            const isValid = await userValidFor(req.user._id, group._id, GroupNotification.ALL);
            if (isValid) myGroups.push(group);
            return isValid;
          }))
          notification.groups = myGroups.map(group => group.name);
          notification.pfp = notification.context[NotificationContext.MEMBER_ID];
          if (myGroups.length === 0) notification = null;
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
  if (!mongoose.Types.ObjectId.isValid(notificationId)) return res.status(400).json({message: "Invalid notification id"});
  try {
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: "Notification cleared"});
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
});

export default router;