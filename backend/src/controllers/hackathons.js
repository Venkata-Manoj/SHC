import Hackathon from '../models/Hackathon.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

export async function list(req, res, next) {
  try {
    const {
      page = 1, limit = 12, search, mode, status, theme,
      sort = '-startDate', minPrize, maxTeamSize, organizer,
    } = req.query;

    const filter = { deletedAt: null, isArchived: false };

    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (theme) filter.themes = theme;
    if (organizer) filter.organizer = { $regex: organizer, $options: 'i' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { themes: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrize) filter.prizePool = { $gte: parseFloat(minPrize) };

    const total = await Hackathon.countDocuments(filter);
    const hackathons = await Hackathon.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json({
      data: hackathons,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate('createdBy', 'name email');
    if (!hackathon || hackathon.deletedAt) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }
    await AnalyticsEvent.create({
      hackathon: hackathon._id, type: 'VIEW',
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const hackathon = await Hackathon.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(hackathon);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'ADMIN' && hackathon.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(hackathon, req.body);
    hackathon.updatedAt = new Date();
    await hackathon.save();
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Not found' });
    hackathon.deletedAt = new Date();
    hackathon.status = 'ENDED';
    await hackathon.save();
    res.json({ message: 'Hackathon soft-deleted' });
  } catch (err) {
    next(err);
  }
}

export async function toggleArchive(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Not found' });
    hackathon.isArchived = !hackathon.isArchived;
    hackathon.archivedAt = hackathon.isArchived ? new Date() : null;
    await hackathon.save();
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

export async function checkDuplicate(req, res, next) {
  try {
    const { name, startDate } = req.query;
    const existing = await Hackathon.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      startDate: new Date(startDate),
      deletedAt: null,
    });
    res.json({ isDuplicate: !!existing });
  } catch (err) {
    next(err);
  }
}
