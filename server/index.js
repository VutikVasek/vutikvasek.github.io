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
import commentRoutes from './routes/comment.js';
import followRoutes from './routes/follow.js';
import feedRoutes from './routes/feed.js';
import notificationRoutes from './routes/notification.js';
import searchRoutes from './routes/search.js';


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/search', searchRoutes);

app.use('/media', express.static(path.join(process.cwd(), 'media')));

mongoose.connect(process.env.MONGO_URI)
 .then(() => {
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 })
 .catch(err => console.error(err));
