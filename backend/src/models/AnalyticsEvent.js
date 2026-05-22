import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  type: { type: String, enum: ['VIEW', 'CLICK'], required: true },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
});

analyticsEventSchema.index({ hackathon: 1, type: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
