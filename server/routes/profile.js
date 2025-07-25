import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { getFeed } from './feed.js';
import { verifyTokenNotStrict } from '../middleware/auth.js';
import { getComments } from './post.js';
import { SchemaType, SchemaTypes, Types } from 'mongoose';

const router = express.Router();

router.get("/user/:username",  verifyTokenNotStrict, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username: username});
  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

  const followers = await Follow.countDocuments({following: user._id});
  const following = await Follow.countDocuments({follower: user._id});

  const follow = await Follow.findOne({follower: req.user?._id, following: user._id});

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

router.get("/user/:username/following", verifyTokenNotStrict, async (req, res) => {
  formatUserList(req, res, 'following')
})

router.get("/user/:username/followers", verifyTokenNotStrict, async (req, res) => {
  formatUserList(req, res, 'follower')
})

const formatUserList = async (req, res, populate) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const username = req.params.username;
    const user = await User.findOne({username: username});
    if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

    const find = ( populate == 'following' ? { follower: user._id } : { following: user._id });
    const userFollow = await Follow.find(find).skip(skip).limit(limit).populate(populate);
    const total = await Follow.countDocuments(find);
    const users = await Promise.all(userFollow.map(async follow => {
      const follows = await Follow.findOne({ follower: req.user?._id, following: follow.following });
      let userInList = populate == "following" ? follow.following : follow.follower;
      if (!userInList) return returnDeleted();
      return {
        username: userInList.username,
        pfp: userInList._id.toString(),
        follows: !!follows,
        notify: follows?.notify,
        itsme: req.user?._id == userInList._id
      }
    }))
    const followList = {userList: users, logged: !!req.user, hasMore: skip + users.length < total}
    res.json(followList);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err});
  }
}

const returnDeleted = () => {
  return {
    username: "<deleted>",
    pfp: "<deleted>",
    follows: false,
    notify: false,
    itsme: true
  }
}

export default router;