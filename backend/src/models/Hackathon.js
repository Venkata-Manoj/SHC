import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationLink: { type: String, required: true },
  mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], required: true },
  location: { type: String, trim: true },
  embeddedMapUrl: String,
  description: { type: String, default: '' },

  themes: [String],
  judgingCriteria: [String],
  teamSizeMin: { type: Number, default: 1 },
  teamSizeMax: { type: Number, default: 4 },
  prizePool: String,
  sponsors: [{ name: String, logo: String }],
  schedule: [{ phase: String, date: Date, description: String }],
  contactInfo: { email: String, phone: String },

  coverImage: String,
  registrationDeadline: Date,
  organizer: { type: String, trim: true },

  status: {
    type: String,
    enum: ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED'],
    default: 'UPCOMING',
  },
  statusOverride: { type: Boolean, default: false },

  isRegistrationLinkBroken: { type: Boolean, default: false },
  registrationLinkOverride: { type: Boolean, default: false },

  isArchived: { type: Boolean, default: false },
  archivedAt: Date,
  deletedAt: Date,

  visibleFields: { type: [String], default: [] },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

hackathonSchema.index({ name: 1, startDate: 1 });
hackathonSchema.index({ status: 1, startDate: -1 });
hackathonSchema.index({ mode: 1 });
hackathonSchema.index({ isArchived: 1, deletedAt: 1 });
hackathonSchema.index({ name: 'text', description: 'text', themes: 'text' });

hackathonSchema.pre('save', function (next) {
  if (this.statusOverride) return next();
  const now = new Date();
  if (now < this.startDate) this.status = 'UPCOMING';
  else if (now >= this.startDate && now <= this.endDate) this.status = 'ONGOING';
  else this.status = 'ENDED';
  next();
});

export default mongoose.model('Hackathon', hackathonSchema);
