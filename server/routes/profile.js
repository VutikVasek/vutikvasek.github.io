import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { getFeed } from './feed.js';
import { verifyTokenNotStrict } from '../middleware/auth.js';
import { getComments } from './post.js';
import { Types } from 'mongoose';

const router = express.Router();

router.get("/user/:username",  verifyTokenNotStrict, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username: username});
  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

  const followers = await Follow.countDocuments({following: user._id});
  const following = await Follow.countDocuments({follower: user._id});

  const follow = await Follow.findOne({follower: req.user._id, following: user._id});

  res.json({username: user.username, 
            bio: user.bio, 
            pfp: user._id.toString(), 
            createdAt: user.createdAt, 
            logged: !!req.user, 
            logFollows: !!follow, 
            notify: follow?.notify,
            followers,
            following,
            itsme: user._id == req.user?._id });
})

router.get("/posts/:username", verifyTokenNotStrict, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username});

  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});
  
  getFeed(req, res, {author: user._id});
})

router.get("/comments/:id", verifyTokenNotStrict, async (req, res) => {
  getComments(req, res, { author: new Types.ObjectId(req.params.id) })
})

export default router;