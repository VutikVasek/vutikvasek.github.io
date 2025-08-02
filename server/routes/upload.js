import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/pfp', verifyToken, upload.single('pfp'), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const outputPath = path.join('media', 'pfp', `${userId}.jpeg`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(req.file.buffer)
      .resize(128, 128)
      .resize({
        width: 128,
        height: 128,
        fit: sharp.fit.cover,
        position: 'center'
      })
      .jpeg()
      .toFile(outputPath);

    res.json({ message: 'Profile picture uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

router.post('/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const isGif = req.file.mimetype === "image/gif";
    const extension = isGif ? "gif" : "webp";
    const post = await Post.findById(req.body.id).select('mediaType');
    if (post) {
      post.mediaType[req.body.index] = extension;
      await post.save();
    } else {
      const comment = await Comment.findById(req.body.id).select('mediaType');
      comment.mediaType = extension;
      await comment.save();
      console.log(comment);
    }

    const outputPath = path.join('media', 'image', `${req.body.id + req.body.index}.${extension}`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    if (isGif) {
      await sharp(req.file.buffer, { animated: true })
        .resize({
          width: 1920,
          height: 1920,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .gif()
        .toFile(outputPath);
    } else {
      await sharp(req.file.buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .webp()
        .toFile(outputPath);
    }

    res.json({ message: 'Image uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});


export default router;