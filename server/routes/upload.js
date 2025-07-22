import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/pfp', verifyToken, upload.single('pfp'), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log(req.user._id, userId);
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


export default router;