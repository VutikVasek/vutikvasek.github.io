import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import Group from '../models/Group.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) res.json([]);

  try {
    const users = await User.find({ username: { $regex: query, $options: "i" }}).select('username').limit(10);
    res.json(users.map(user => ({ _id: user._id, name: user.username })));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.get('/mygroups', verifyToken, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) res.json([]);

  try {
    const groups = await Group.find({ members: req.user._id, name: { $regex: query, $options: "i" }  }).select('name everyoneCanPost admins').limit(10);
    res.json(groups.filter(group => group.everyoneCanPost || group.admins.includes(req.user._id)));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;