import express from 'express';
import dotenv, { populate } from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import uploadRoutes from './routes/upload.js';
import profileRoutes from './routes/profile.js';
import postRoutes from './routes/post.js';

import Item from './models/Item.js';
import Post from './models/Post.js';
import { verifyToken, verifyTokenNotStrict } from './middleware/auth.js';
import User from './models/User.js';
import { formatPost } from './tools/formater.js';


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/post', postRoutes);
app.use('/media', express.static(path.join(process.cwd(), 'media')));

mongoose.connect(process.env.MONGO_URI)
 .then(() => {
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 })
 .catch(err => console.error(err));


// Get posts
app.get('/api/posts', verifyTokenNotStrict, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Post.countDocuments();
    
    const postsWithAuthors = await Promise.all(
      posts.map(async (unpost) => await formatPost(unpost, req.user?._id))
    );

    res.json({
      posts: postsWithAuthors,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
});

// Get all
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ messege: err.messege });
  }
});

// New item
app.post('/api/items', async (req, res ) => {
  const newItem = new Item({ name: req.body.name });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})