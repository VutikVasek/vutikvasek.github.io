import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../middleware/auth.js';
import Group from '../models/Group.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/pfp', verifyToken, upload.single('pfp'), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const outputPath = path.join('media', 'pfp', `${userId}.jpeg`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(req.file.buffer)
      .resize({
        width: 256,
        height: 256,
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
    const outputPath = path.join('media', 'image', `${req.body.id + req.body.index}.webp`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(req.file.buffer, { animated: true })
      .resize({
        width: 1920,
        height: 1920,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .webp()
      .toFile(outputPath);

    res.json({ message: 'Image uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

router.post('/gp/:groupId', verifyToken, upload.single('gp'), async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const group = await Group.findById(groupId).select('admins');
    if (!group) return res.status(404).json({ message: "We didn't find that group" });
    const isAdmin = group.admins.includes(req.user._id);
    if (!isAdmin) return res.status(401).json({ message: "You need to be admin of this group to change the picture" });

    const outputPath = path.join('media', 'gp', `${groupId}.webp`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(req.file.buffer)
      .resize({
        width: 256,
        height: 256,
        fit: sharp.fit.cover,
        position: 'center'
      })
      .webp()
      .toFile(outputPath);

    res.json({ message: 'Group picture uploaded successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload the group picture' });
  }
});

export default router;