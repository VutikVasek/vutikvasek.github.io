import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  for: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: Number, required: true },
  context: { type: [mongoose.Schema.Types.ObjectId] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', NotificationSchema);