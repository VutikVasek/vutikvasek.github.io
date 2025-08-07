import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  members: { type: [mongoose.Types.ObjectId], ref: 'User' },
  admins: { type: [mongoose.Types.ObjectId], ref: 'User' },
  owner: { type: mongoose.Types.ObjectId, ref: 'User' },
  pinnedPost: { type: mongoose.Types.ObjectId, ref: 'Post' },
  private: { type: Boolean, default: false },
  requestJoin: { type: Boolean, default: false },
  everyoneCanPost: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Group', GroupSchema);