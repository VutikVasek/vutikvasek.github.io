import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { NotificationType } from '../../shared.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const user  = await User.findById(req.body.following).select('notifications _id');
  if (!user) return res.status(404).json({ message: "Trying to follow non-existent user"});
  if (user._id == req.user._id) return res.status(400).json({ message: "You cannot follow yourself" });
  try {
    const follow = await Follow.create({ follower: req.user._id, following: req.body.following });

    try {
      if (user.notifications[NotificationType.NEW_FOLLOWER]) {
        const notif = new Notification({ for: req.body.following, type: NotificationType.NEW_FOLLOWER, context: [req.user._id] });
        await notif.save();
      }
    } catch (err) {
      console.log(err)
    }

    res.status(201).json({ message: "User succesfuly followed" });
  } catch (err) {
    res.status(500).json({ message: err || "Server error" });
  } 
})

router.delete('/delete', verifyToken, async (req, res) => {
  try {
    await Follow.findOneAndDelete({ follower: req.user._id, following: req.body.following });
    try {
      await Notification.findOneAndDelete({ for: req.body.following, type: NotificationType.NEW_FOLLOWER, context: [req.user._id] });
    } catch (err) {
      console.log(err)
    }
    res.status(201).json({ message: "User succesfuly unfollowed" });
  } catch (err) {
    res.status(500).json({ message: err || "Server error" });
  } 
});

router.patch('/change', verifyToken, async (req, res) => {
  try {
    await Follow.findOneAndUpdate({ follower: req.user._id, following: req.body.following }, { notify: req.body.notify });
    res.status(201).json({ message: "Notification changed" });
  } catch (err) {
    res.status(500).json({ message: err || "Server error" });
  } 
})

export default router;