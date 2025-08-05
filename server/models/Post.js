import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{type: mongoose.Schema.Types.ObjectId}],
  mentions: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', PostSchema);