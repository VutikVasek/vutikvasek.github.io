import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { getFeed } from './feed.js';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import { getComments } from './post.js';
import { Types } from 'mongoose';
import Group from '../models/Group.js';
import { GroupNotification } from '../../shared.js';

const router = express.Router();

router.get("/user/:username",  verifyTokenNotStrict, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username: username});
  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

  const followers = await Follow.countDocuments({following: user._id});
  const following = await Follow.countDocuments({follower: user._id});
  const groups = await Group.countDocuments({members: user._id});

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
            groups,
            itsme: user._id == req.user?._id });
})

router.get("/posts/:username", verifyTokenNotStrict, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({username});

  if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});
  
  getFeed(req, res, { author: user._id }, !user._id.equals(req.user?._id) );
})

router.get("/comments/:id", verifyTokenNotStrict, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({message: "Invalid id"});
  getComments(req, res, { author: new Types.ObjectId(req.params.id) })
})

router.get("/user/:username/following", verifyTokenNotStrict, async (req, res) => {
  formatUserList(req, res, 'following')
})

router.get("/user/:username/followers", verifyTokenNotStrict, async (req, res) => {
  formatUserList(req, res, 'follower')
})

router.get('/user/:username/groups', verifyTokenNotStrict, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const username = req.params.username;
    const user = await User.findOne({username: username});
    if (!user) return res.status(404).json({ message: `No user with username ${username} was found`});

    const groups = await Group.find({ members: user._id }).skip(skip).limit(limit);
    const total = await Group.countDocuments({ members: user._id });

    const myGroups = groups.map(group => 
      ({
        name: group.name,
        gp: group._id.toString(),
        member: group.members.includes(req.user?._id),
        owner: group.owner.equals(req.user?._id),
        banned: group.banned.includes(req.user?._id),
        notification: user.groupsNotifications?.get(group._id.toString()),
      })
    );

    res.json({
      groupList: myGroups,
      logged: !!req.user, 
      hasMore: skip + groups.length < total
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err});
  }
})

router.get('/groups', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user._id; 
    const user = await User.findById(userId).select('groupsNotifications');

    const groups = await Group.find({ members: userId }).skip(skip).limit(limit).select('name');
    const total = await Group.find({ members: userId });

    const myGroups = groups.map(group => 
      ({
        name: group.name,
        gp: group._id.toString(),
        notification: user.groupsNotifications.get(group._id.toString())
      })
    );

    res.json({
      groupList: myGroups,
      logged: !!req.user, 
      hasMore: skip + users.length < total
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err});
  }
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