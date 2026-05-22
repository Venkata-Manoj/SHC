import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import crypto from 'crypto';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
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
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
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
      token,
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
    const invite = await Invite.findOne({ token, usedAt: null, expiresAt: { $gt: new Date() } });
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
