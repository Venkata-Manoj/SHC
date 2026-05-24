import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['ADMIN', 'COORDINATOR', 'STUDENT'], default: 'STUDENT' },
  college: { type: String, trim: true },
  department: { type: String, trim: true },
  scope: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  isSandboxMode: { type: Boolean, default: false },
  profileImage: String,
  lastLoginAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
