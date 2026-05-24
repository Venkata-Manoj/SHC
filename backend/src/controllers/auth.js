import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import crypto from 'crypto';
import { sendEmail } from '../services/email.js';
import { getJwtSecret } from '../middleware/auth.js';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password, name, college, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await User.create({ email, password, name, college, department, isVerified: true });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updates = {};
    for (const field of ['name', 'college', 'department', 'profileImage']) {
      if (req.body[field]) updates[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function inviteCoordinator(req, res, next) {
  try {
    const { email, scope } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const invite = await Invite.create({
      email,
      tokenHash: Invite.hashToken(token),
      role: 'COORDINATOR',
      scope: scope || [],
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.status(201).json({ invite, inviteLink: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/accept-invite?token=${token}` });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token, password, name } = req.body;
    const tokenHash = Invite.hashToken(token);
    const invite = await Invite.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } });
    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired invite' });
    }
    const user = await User.create({
      email: invite.email,
      password,
      name,
      role: 'COORDINATOR',
      isVerified: true,
      scope: invite.scope,
    });
    invite.usedAt = new Date();
    await invite.save();
    const jwtToken = generateToken(user);
    res.status(201).json({ user, token: jwtToken });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const emailResetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;
      const result = await sendEmail({
        to: user.email,
        subject: 'Password Reset — SIMATS Hackathon',
        text: `You requested a password reset. Click the link: ${emailResetUrl}\nThis link expires in 1 hour.`,
        html: `<p>You requested a password reset.</p><p><a href="${emailResetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
      });

      if (result?.devMode) {
        return res.json({ message: 'If an account exists, a password reset email has been sent', devMode: true, resetUrl: emailResetUrl });
      }
    }

    res.json({ message: 'If an account exists, a password reset email has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}
