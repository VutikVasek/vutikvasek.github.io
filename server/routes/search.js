import express from 'express';
import User from '../models/User.js';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Group from '../models/Group.js';
import stringSimilarity from 'string-similarity'
import { getFeed } from './feed.js';
import Follow from '../models/Follow.js';
import { getComments } from './post.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json([]);

  try {
    const users = await User.find({ username: { $regex: query, $options: "i" }}).select('username');
    const sorted = users
      .map(user => ({
        ...user.toObject(),
        score: stringSimilarity.compareTwoStrings(user.username.toLowerCase(), query.toLowerCase())
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json(sorted.map(user => ({ _id: user._id, name: user.username })));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.get('/mygroups', verifyToken, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json([]);

  try {
    const groups = await Group.find({ members: req.user._id, name: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: "i" }  }).select('name everyoneCanPost admins');
    const sorted = groups.filter(group => group.everyoneCanPost || group.admins.includes(req.user._id))
      .map(group => ({
        ...group.toObject(),
        score: stringSimilarity.compareTwoStrings(group.name.toLowerCase(), query.toLowerCase())
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json(sorted.map(group => ({_id: group._id, name: group.name})));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.get('/for/users', verifyTokenNotStrict, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({userList: []});
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const users = await User.find({ username: { $regex: query, $options: "i" }}).select('username bio');
    const sorted = users
      .map(user => ({
        ...user.toObject(),
        score: stringSimilarity.compareTwoStrings(user.username.toLowerCase(), query.toLowerCase())
      }))
      .sort((a, b) => b.score - a.score)
      .slice(skip, skip + limit);

    const userList = await Promise.all(sorted.map(async user => {
      const follows = await Follow.findOne({ follower: req.user?._id, following: user._id });
      return {
        username: user.username,
        pfp: user._id,
        bio: user.bio,
        follows: !!follows,
        notify: follows?.notify,
        itsme: user._id.equals(req.user?._id)
      }
    }));
    res.json({
      userList, 
      logged: !!req.user, 
      hasMore: skip + sorted.length < users.length});
  } catch (err) { 
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.get('/for/posts', verifyTokenNotStrict, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({posts: []});
  getFeed(req, res, { text: { $regex: query, $options: "i" } });
})

router.get('/for/replies', verifyTokenNotStrict, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({comments: []});
  getComments(req, res, { text: { $regex: query, $options: "i" } })
})

router.get('/for/groups', verifyTokenNotStrict, async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({comments: []});
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  try {
    const groups = await Group.find({ name: { $regex: query, $options: "i" }}).select('name');
    const sorted = groups
      .map(group => ({
        ...group.toObject(),
        score: stringSimilarity.compareTwoStrings(group.name.toLowerCase(), query.toLowerCase())
      }))
      .sort((a, b) => b.score - a.score)
      .slice(skip, skip + limit);

    const groupList = await Promise.all(sorted.map(async group => {
      const groupInfo = await Group.findById(group._id).select('members owner banned description');
      return {
        name: group.name,
        gp: group._id.toString(),
        description: groupInfo.description,
        member: groupInfo.members.includes(req.user?._id),
        owner: groupInfo.owner.equals(req.user?._id),
        banned: groupInfo.banned.includes(req.user?._id),
      }
    }));

    res.json({
      groupList,
      logged: !!req.user, 
      hasMore: skip + groupList.length < groups.length
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err});
  }
})

export default router;