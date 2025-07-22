import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../tools/mailer.js';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// import { sendVerificationEmail } from '../middleware/mailer.js';import nodemailer from 'nodemailer';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const correctedEmail = email.toLowerCase();

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'Username taken' });
  const existingE = await User.findOne({ email: correctedEmail });
  if (existingE) return res.status(400).json({ message: 'Email already used with different username' });
  
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email: correctedEmail, password: hashed, verifyToken, verified: false });

  sendEmail(
    correctedEmail,
    'Verify your email',
    `<h1>Welcome!</h1><p>Click <a href="http://localhost:5173/verify?token=${verifyToken}">here</a> to verify your account.</p>`
  );
  
  res.status(201).json({ message: 'Signup successful, please check your email to verify your account' });
});

// Account verify
router.get('/verify', async (req, res) => {
  const { token, email } = req.query;
  const user = await User.findOne({ verifyToken: token });

  if (!user) return res.status(400).json({ message: 'Invalid verification link' });

  user.verified = true;
  user.verifyToken = undefined;
  user.tokenVersion++;
  if (email) user.email = email;
  await user.save();

  res.status(201).json({ message: 'Email verified!' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });
  if (!user) {
    user = await User.findOne({ email: username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
  };

  if (!user.password && !!user.googleId) {
    return res.status(403).json({ message: 'Please log in with Google' });
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify your email first' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ _id: user._id, tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username, created: user.createdAt } });
});

// Google Sign-in
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ googleId: sub, email: email, username: name, verified: true });
      await user.save();
    } else if (!user.googleId) {
      await User.findOneAndUpdate({ email }, { googleId: sub });
    }

    const jwtToken = jwt.sign({ _id: user._id, tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user: { id: user._id, username: user.username, created: user.createdAt } });
  } catch (err) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

export default router;
