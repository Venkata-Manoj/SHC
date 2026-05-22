import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  hackathonData: {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationLink: { type: String, required: true },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], required: true },
    location: String,
    description: String,
    themes: [String],
    prizePool: String,
    organizer: String,
    coverImage: String,
  },
  submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submitterEmail: { type: String, required: true },
  posterUrl: String,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  reviewNote: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  duplicationWarning: Boolean,
  createdAt: { type: Date, default: Date.now },
});

submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ submitter: 1 });

export default mongoose.model('Submission', submissionSchema);
