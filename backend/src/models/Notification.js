import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['NEW_SUBMISSION', 'SUBMISSION_REVIEWED', 'HACKATHON_CREATED'],
    required: true,
  },
  message: { type: String, required: true },
  refId: { type: mongoose.Schema.Types.ObjectId },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
