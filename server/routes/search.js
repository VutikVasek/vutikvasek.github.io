import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) res.json([]);

  try {
    const users = await User.find({ username: { $regex: query, $options: "i" }}).select('username').limit(10);
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;