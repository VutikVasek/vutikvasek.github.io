import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import mongoose from 'mongoose';
import { getFeed } from './feed.js';
import Post from '../models/Post.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { name, description, isPrivate, requestJoin, everyoneCanPost } = req.body;
  const userId = req.user._id;
  try {
    const ownedGroups = await Group.countDocuments({ owner: userId });
    if (ownedGroups >= 5) return res.status(400).json({ message: "You can only own up to 5 groups", tooMany: true });

    const existingName = await Group.exists({ name });
    if (existingName) return res.status(400).json({ message: "There already exists a group with this name" });

    const newGroup = new Group({ name, description, members: [userId], admins: [userId], owner: userId, private: isPrivate, requestJoin, everyoneCanPost });
    await newGroup.save();

    res.json({message: "Group succesfully created", group: newGroup});
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.get('/:groupname', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    let canUserPost = false;
    if (req.user) {
      if (group.everyoneCanPost) canUserPost = true;
      else {
        const isAdmin = group.admins.includes(req.user._id);
        if (isAdmin) canUserPost = true;
      }
    }
    return res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      members: group.members.length,
      pinnedPost: group.pinnedPost,
      private: group.private,
      requestJoin: group.requestJoin,
      canUserPost,
      member: group.members.includes(req.user._id),
      admin: group.admins.includes(req.user._id),
      owner: group.owner.toString() === req.user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.get('/:groupname/posts', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  const group = await Group.findOne({name: groupname}).select('_id');
  if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
  getFeed(req, res, { groups: group._id })
})

router.get('/:groupname/members', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const group = await Group.findOne({name: groupname}).select('members admins owner');
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    const members = await Promise.all(group.members.slice(skip, skip + limit).map(async memberId => {
      const member = await User.findById(memberId);
      if (!member) return returnDeleted();
      const follows = await Follow.findOne({ follower: req.user?._id, following: memberId });
      return {
        username: member.username,
        pfp: memberId,
        follows: !!follows,
        notify: follows?.notify,
        itsme: member._id.equals(req.user?._id),
        admin: group.admins.includes(member._id),
        owner: group.owner.equals(member._id),
      }
    }));
    const groupMembers = {
      userList: members, 
      logged: !!req.user, 
      hasMore: skip + members.length < group.members.length,
      group: {
        admin: group.admins.includes(req.user?._id),
        owner: group.owner.equals(req.user?._id)
      }};
    res.json(groupMembers)
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

const returnDeleted = () => {
  return {
    username: "<deleted>",
    pfp: "<deleted>",
    follows: false,
    notify: false,
    itsme: true
  }
}

router.delete('/p/:postId/:groupId', verifyToken, async (req, res) => {
  const { postId, groupId } = req.params;
  try {
    const group = await Group.findById(groupId).select('admins');
    if (!group) return res.status(404).json({ message: "We didn't find a group with the id " + groupId });
    if (!group.admins.includes(req.user._id)) return res.status(403);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "We didn't find that post"});

    post.groups = post.groups.filter(postGroupId => !postGroupId.equals(groupId));
    await post.save();
    res.json({ message: "Post removed from group" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

export default router;