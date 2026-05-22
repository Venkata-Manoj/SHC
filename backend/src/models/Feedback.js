import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  email: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['FEEDBACK', 'FEATURE_REQUEST', 'BUG_REPORT'], default: 'FEEDBACK' },
  votes: { type: Number, default: 0 },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Feedback', feedbackSchema);
