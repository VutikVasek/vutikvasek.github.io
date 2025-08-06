import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Group from '../models/Group.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { name, isPrivate, everyoneCanPost } = req.body;
  const userId = req.user._id;
  try {
    const ownedGroups = await Group.countDocuments({ owner: userId });
    if (ownedGroups >= 5) return res.status(400).json({ message: "You can only own up to 5 groups", tooMany: true });

    const existingName = await Group.exists({ name });
    if (existingName) return res.status(400).json({ message: "There already exists a group with this name" });

    const newGroup = new Group({ name, members: [userId], admins: [userId], owner: userId, private: isPrivate, everyoneCanPost });
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
    return {
      _id: group._id,
      name: group.name,
      members: group.members.length,
      pinnedPost: group.pinnedPost,
      private: group.private,
      canUserPost,
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

export default router;