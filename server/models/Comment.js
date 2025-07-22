import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, required: true},
  text: { type: String, required: true },
  likes: [{type: mongoose.Schema.Types.ObjectId}],
  comments: [{type: mongoose.Schema.Types.ObjectId}],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', CommentSchema);