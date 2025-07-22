import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { formatPostWithUser } from '../tools/formater.js';

const router = express.Router();

router.get("/user/:username", async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username: username});
  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

  res.json({ username: user.username, bio: user.bio, pfp: user._id.toString(), createdAt: user.createdAt });
})

router.get("/posts/:username", async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username});

  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find({author: user._id}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Post.countDocuments();
    
    const postsWithAuthors = await Promise.all(
      posts.map(async (postDB) => await formatPostWithUser(postDB, user))
    );

    res.json({
      posts: postsWithAuthors,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
})

export default router;