import express from 'express';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import mongoose from 'mongoose';
import { getFeed } from './feed.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { GroupNotification, NotificationType } from '../../shared.js';
import { formatPost } from '../tools/formater.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { name, description, isPrivate, requestJoin, everyoneCanPost } = req.body;
  const userId = req.user._id;
  try {
    const ownedGroups = await Group.countDocuments({ owner: userId });
    if (ownedGroups >= 10) return res.status(400).json({ message: "You can only own up to 10 groups", tooMany: true });

    const existingName = await Group.exists({ name });
    if (existingName) return res.status(400).json({ message: "There already exists a group with this name" });

    const newGroup = new Group({ name, description, members: [userId], admins: [userId], owner: userId, private: isPrivate, requestJoin, everyoneCanPost });
    await newGroup.save();

    await setNotification(userId, newGroup._id, GroupNotification.ESSENTIAL);

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

    const logged = !!req.user;
    const member = group.members.includes(req.user?._id);

    const isAdmin = group.admins.includes(req.user?._id);

    let canUserPost = false;
    if (req.user && member && (group.everyoneCanPost || isAdmin)) canUserPost = true;

    return res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      members: group.members.length,
      pinnedPost: group.pinnedPost,
      private: group.private,
      requestJoin: group.requestJoin,
      everyoneCanPost: group.everyoneCanPost,
      canUserPost,
      member,
      admin: isAdmin,
      owner: group.owner.toString() === req.user?._id,
      banned: group.banned.includes(req.user?._id),
      bans: isAdmin ? group.banned.length : null,
      logged
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.get('/:id/name', async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) res.status(400).json({ message: "Invalid id" })
  const group = await Group.findById(id).select('name');
  res.json({ name: group?.name ?? "<deleted>" });
})

router.post('/:groupId/update', verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
    if (!mongoose.Types.ObjectId.isValid(groupId)) return res.status(400).json({message: "Invalid group id"});
  const { name, description, isPrivate, requestJoin, everyoneCanPost } = req.body;
  const userId = req.user._id;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to update the group" });

    const existingName = await Group.exists({ name });
    if (existingName && (name !== group.name)) return res.status(400).json({ message: "There already exists a group with this name" });

    const newGroup = new Group({ name, description, members: [userId], admins: [userId], owner: userId, private: isPrivate, requestJoin, everyoneCanPost });
    if (group.name !== name) group.name = name;
    if (group.description !== description) group.description = description;
    if (group.private !== isPrivate) group.private = isPrivate;
    if (group.requestJoin !== requestJoin) group.requestJoin = requestJoin;
    if (group.everyoneCanPost !== everyoneCanPost) group.everyoneCanPost = everyoneCanPost;
    await group.save();
    
    res.json({ message: "The group has been updated", group: { _id: group._id } });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.get('/:groupname/posts', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  const group = await Group.findOne({name: groupname}).select('_id private members');
  if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
  if (group.private && !group.members.includes(req.user?._id)) return res.status(404).json({ message: "You are not a member of this group" });
  getFeed(req, res, { groups: group._id })
})

router.get('/:groupname/pinned', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  const group = await Group.findOne({name: groupname}).select('_id pinnedPost');
  if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
  if (!group.pinnedPost) return res.status(400).json({ message: "This group doesn't have a pinned post" });
  const post = await Post.findById(group.pinnedPost);
  if (!post) return res.status(404).json({ message: "We didn't find the pinned post" });
  res.json(await formatPost(post, req.user?._id));
})

router.get('/:groupname/members', verifyTokenNotStrict, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const group = await Group.findOne({name: groupname}).select('members admins owner name');
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
        owner: group.owner.equals(member._id)
      }
    }));
    const groupMembers = {
      userList: members, 
      logged: !!req.user, 
      hasMore: skip + members.length < group.members.length,
      group: {
        admin: group.admins.includes(req.user?._id),
        owner: group.owner.equals(req.user?._id),
        _id: group._id,
        name: group.name
      }};
    res.json(groupMembers)
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.get('/:groupname/banned', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const group = await Group.findOne({name: groupname}).select('banned admins owner name');
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(400).json({ message: "You need to be an admin to see banned users" });
    const banned = await Promise.all(group.banned.slice(skip, skip + limit).map(async bannedId => {
      const bannedUser = await User.findById(bannedId);
      if (!bannedUser) return returnDeleted();
      const follows = await Follow.findOne({ follower: req.user?._id, following: bannedId });
      return {
        username: bannedUser.username,
        pfp: bannedId,
        follows: !!follows,
        notify: follows?.notify,
        banned: true
      }
    }));
    const groupBanned = {
      userList: banned, 
      logged: !!req.user, 
      hasMore: skip + banned.length < group.banned.length,
      group: {
        _id: group._id,
        name: group.name,
        admin: true
      }};
    res.json(groupBanned)
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

router.delete('/:groupId/p/:postId', verifyToken, async (req, res) => {
  const { postId, groupId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({message: "Invalid post id"});
  if (!mongoose.Types.ObjectId.isValid(groupId)) return res.status(400).json({message: "Invalid group id"});
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

router.delete('/:groupname/leave', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname}).select('members');
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    group.members = group.members.filter(userId => !userId.equals(req.user._id));
    await group.save();
    await Notification.deleteOne({ for: group.owner, type: NotificationType.NEW_MEMBER, context: req.user._id})
    await deleteNotification(req.user._id, group._id);
    res.json({ message: "You succesfully left the group" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.put('/:groupname/join', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (group.banned.includes(req.user._id)) return res.status(403).json({ message: "You are banned from this group" });
    if (group.requestJoin) return res.status(400).json({ message: "You need to send a request to join  " + groupname });
    group.members.push(req.user._id);
    await group.save();
    await notify(group.owner, group._id, GroupNotification.ALL, 
      NotificationType.NEW_MEMBER, [group._id, req.user._id]);
    await setNotification(req.user._id, group._id, GroupNotification.ESSENTIAL);
    res.json({ message: "You succesfully joined the group" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.post('/:groupname/request', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (group.banned.includes(req.user._id)) return res.status(403).json({ message: "You are banned from this group" });
    if (!group.requestJoin) return res.status(400).json({ message: "This group doesn't require request to join" });
    if (group.members.includes(req.user._id)) return res.status(400).json({ message: "You already are a member of this group" });
    const alreadyRequested = await Notification.exists({type: NotificationType.GROUP_JOIN_REQUEST, context: [group._id, req.user._id]});
    if (alreadyRequested) return res.status(400).json({ message: "You have already sent a join request to this group" });

    await notify(group.owner, group._id, GroupNotification.ESSENTIAL, 
      NotificationType.GROUP_JOIN_REQUEST, [group._id, req.user._id])
    group.admins.forEach(async admin => {
      await notify(admin, group._id, GroupNotification.ESSENTIAL, 
        NotificationType.GROUP_JOIN_REQUEST, [group._id, req.user._id])
    })
    res.json({ message: "The request has been send" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.post('/:groupname/accept/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: "Invalid user id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to accept join requests" });
    if (!group.requestJoin) return res.status(400).json({ message: "This group doesn't require request to join" });
    if (group.banned.includes(req.user._id)) return res.status(400).json({ message: "This user is banned" });
    if (group.members.includes(userId)) return res.status(400).json({ message: "This user is already in this group" });
    const request = await Notification.exists({type: NotificationType.GROUP_JOIN_REQUEST, context: [group._id, userId]});
    if (!request)  return res.status(400).json({ message: "This user hasn't requested to join" });

    group.members.push(userId);
    await group.save();
    
    const notif = new Notification({ for: userId, type: NotificationType.GROUP_JOIN_ACCEPT, context: [group._id] });
    await notif.save();
    
    await notify(group.owner, group._id, GroupNotification.ALL, 
      NotificationType.NEW_MEMBER, [group._id, userId])
      
    await Notification.deleteMany({ type: NotificationType.GROUP_JOIN_REQUEST, context: [group._id, userId]});

    res.json({ message: "The request has been accepted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.post('/:groupname/deny/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: "Invalid user id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to accept join requests" });
    if (!group.requestJoin) return res.status(400).json({ message: "This group doesn't require request to join" });
    const request = await Notification.exists({type: NotificationType.GROUP_JOIN_REQUEST, context: [group._id, userId]});
    if (!request)  return res.status(400).json({ message: "This user hasn't requested to join" });
    
    if (!group.members.includes(userId)) {
      const notif = new Notification({ for: userId, type: NotificationType.GROUP_JOIN_DENY, context: [group._id] });
      await notif.save();
    }
      
    await Notification.deleteMany({ type: NotificationType.GROUP_JOIN_REQUEST, context: [group._id, userId]});

    res.json({ message: "The request has been dennied" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.patch('/:groupname/admin/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: "Invalid user id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to make someone admin" });
    if (!group.members.includes(userId)) return res.status(400).json({ message: "This user isn't a member of this group" });
    if (group.admins.includes(userId)) return res.status(400).json({ message: "This user is admin already" });
    
    group.admins.push(userId);
    await group.save();

    await notify(userId, group._id, GroupNotification.ESSENTIAL, 
      NotificationType.MADE_ADMIN, [group._id]);
    
    res.json({ message: "The user has been made admin" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.patch('/:groupname/deadmin/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: "Invalid user id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to make someone admin" });
    if (!group.admins.includes(userId)) return res.status(400).json({ message: "This user isn't admin" });
    
    group.admins = group.admins.filter(adminId => !adminId.equals(userId));
    await group.save();

    await notify(userId, group._id, GroupNotification.ESSENTIAL, 
      NotificationType.REVOKED_ADMIN, [group._id]);
    
    res.json({ message: "The user has been revoked of their admin status" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.put('/:groupname/pin/:postId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({message: "Invalid post id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to pin a post" });
    const post = await Post.findById(postId).select('');
    if (!post) return res.status(404).json({ message: "We didn't find that post" });

    group.pinnedPost = postId;
    await group.save();
    
    res.json({ message: "The post has been pinned" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.put('/:groupname/unpin', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to unpin a post" });

    group.pinnedPost = null;
    await group.save();
    
    res.json({ message: "The post has been unpinned" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.put('/:groupname/ban/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user id" });
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to ban people" });
    if (group.owner.equals(userId)) return res.status(403).json({ message: "You cannot ban the owner" });

    const user = await User.exists({ _id: userId });
    if (!user) return res.status(404).json({ message: "We didn't find that user" });
    if (group.banned.includes(userId)) return res.status(400).json({ message: "That user is already banned" });
    group.banned.push(userId);

    if (group.members.includes(userId)) {
      group.members = group.members.filter(member => !member.equals(userId));
      group.admins = group.admins.filter(admin => !admin.equals(userId));
    }

    await group.save();

    await deleteNotification(userId, group._id);
    
    res.json({ message: "The user has been banned" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.put('/:groupname/unban/:userId', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: "Invalid user id"});
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "You have to be admin to ban people" });

    const user = await User.exists({ _id: userId });
    if (!user) return res.status(404).json({ message: "We didn't find that user" });
    if (!group.banned.includes(userId)) return res.status(400).json({ message: "That user isn't banned" });

    group.banned = group.banned.filter(bannedId => !bannedId.equals(userId));
    await group.save();
    
    res.json({ message: "The user has been unbanned" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.delete('/:groupname', verifyToken, async (req, res) => {
  const groupname = req.params.groupname;
  try {
    const group = await Group.findOne({name: groupname});
    if (!group) return res.status(404).json({ message: "We didn't find a group with the name " + groupname });
    if (!group.owner.equals(req.user._id)) return res.status(403).json({ message: "You have to be the owner to delete the group" });

    await Group.findByIdAndDelete(group._id);
    await Notification.deleteMany({ context: group._id });
    
    res.json({ message: "The group has been deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

router.patch('/:groupId/notification', verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  if (!mongoose.Types.ObjectId.isValid(groupId)) return res.status(400).json({message: "Invalid group id"});
  const notification = parseInt(req.body.notification);
  try {
    const user = await User.findById(req.user._id).select('groupsNotifications');
    user.groupsNotifications.set(groupId, notification);
    await user.save();
    res.json({ message: "ok" });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
})

const setNotification = async (userId, groupId, value) => {
  const user = await User.findById(userId).select('groupsNotifications');
  setNotificationForUser(user, groupId, value);
}

const setNotificationForUser = async (user, groupId, value) => {
  if (!user.groupsNotifications) user.groupsNotifications = {};
  user.groupsNotifications.set(groupId.toString(), value);
  await user.save();
}

export const userValidFor = async (userId, groupId, value) => {
  const user = await User.findById(userId).select('groupsNotifications username');
  if (!user) return false;
  if (!user.groupsNotifications) {
    user.groupsNotifications = {};
    return false;
  } 
  return value >= user.groupsNotifications.get(groupId.toString());
}

const deleteNotification = async (userId, groupId) => {
  const user = await User.findById(userId).select('groupsNotifications');
  deleteNotificationForUser(user, groupId);
}

const deleteNotificationForUser = async (user, groupId) => {
  user.groupsNotifications?.delete(groupId.toString());
  await user.save();
}

export const notify = async (userId, groupId, validFor, type, context) => {
  if (await userValidFor(userId, groupId, validFor)) {
    const notif = new Notification({ for: userId, type, context});
    await notif.save();
  }
}

export default router;