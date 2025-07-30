import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true},
  password: { type: String },
  verified: { type: Boolean, default: false },
  verifyToken: { type: String },
  tokenVersion: { type: Number, default: 0 },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  bio: { type: String },
  postTimes: { type: [Date]},
  commentTimes: { type: [Date]},
});

export default mongoose.model('User', UserSchema);