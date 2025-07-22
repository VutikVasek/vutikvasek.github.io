import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { sendEmail } from '../tools/mailer.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();


// Account data
router.post('/get', verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id).select('username email createdAt googleId bio');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
  } else {
    // let hasPassword = !!user.password
    // user.password = undefined;
    // res.json({...user._doc, hasPassword});

    user._doc.isGoogle = !!user.googleId;
    user.googleId = undefined;
    res.json( { user } );
  }
})

// Change username
router.patch('/changeusername', verifyToken, async (req, res) => {
  const regex = new RegExp(`^${req.body.newUsername}$`, 'i');

  const existing = await User.findOne({ username: regex });
  if (existing) {
    // console.log((await User.find()).filter({username: regex}));
    const itsme = await User.findOne({ username: regex, _id: req.user._id });
    if (!itsme)
      return res.status(400).json({ message: 'Username taken' });
  } 

  const user = await User.findByIdAndUpdate(req.user._id, { username: req.body.newUsername }, { new: true, runValidators: true } );

  if (!user) {
    res.status(404).json({ message: 'User not found' });
  } else {
    res.json({ message: 'Account updated' });
  }
})

// Change password
router.patch('/changepassword', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.tokenVersion++;
  await user.save();
  res.json({ message: 'Account updated' });
})

// Change email
router.patch('/changeemail', verifyToken, async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const itsme = await User.findOne({ email, _id: req.user._id });
    if (itsme)
      return res.status(400).json({ message: 'You are already using this email' });
    else
      return res.status(400).json({ message: 'Email already used by a different account' });
  } 

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const verifyToken = crypto.randomBytes(32).toString('hex');

  user.verifyToken = verifyToken;
  await user.save();
  
  sendEmail(
    email,
    'Verify your email',
    `<h1>Welcome!</h1><p>Click <a href="http://localhost:5173/verify?token=${verifyToken}&email=${req.body.email}">here</a> to verify your account.</p>`
  );
  res.json({ message: 'Account updated, verification email sent' });
})

// Update bio
router.patch('/changebio', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {bio: req.body.bio});
    return res.json({ message: 'Bio updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
})

// Account deletion
router.delete('/delete', verifyToken, async (req, res) =>  {
  const user = await User.findByIdAndDelete(req.user._id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
  } else {
    res.json({ message: 'Account deleted' });
  }
});

export default router;