import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  role: { type: String, enum: ['COORDINATOR'], required: true },
  scope: [String],
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: Date,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

inviteSchema.statics.hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
inviteSchema.index({ expiresAt: 1 });

export default mongoose.model('Invite', inviteSchema);
