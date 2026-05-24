import Hackathon from '../models/Hackathon.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import { get, set, flush } from '../services/cache.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const CACHE_TTL = 5 * 60 * 1000;

function cacheKey(req) {
  return `hackathons:${req.originalUrl}`;
}

export async function list(req, res, next) {
  try {
    const cached = get(cacheKey(req));
    if (cached) return res.json(cached);

    const {
      page = 1, limit = 12, search, mode, status, theme,
      sort = '-startDate', minPrize, organizer, ids,
    } = req.query;

    const filter = { deletedAt: null };

    if (ids) {
      filter._id = { $in: ids.split(',') };
    }

    if (req.query.archived === 'true') {
      filter.isArchived = true;
    } else if (!ids) {
      filter.isArchived = false;
    }

    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (theme) filter.themes = theme;
    if (organizer) filter.organizer = { $regex: escapeRegex(organizer), $options: 'i' };

    const isSearch = !!search;
    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrize) filter.prizePoolValue = { $gte: parseFloat(minPrize) };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const total = await Hackathon.countDocuments(filter);
    const projection = isSearch ? { score: { $meta: 'textScore' } } : {};
    const hackathons = await Hackathon.find(filter, projection)
      .sort(isSearch ? { score: { $meta: 'textScore' } } : sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const result = {
      data: hackathons,
      pagination: {
        page: pageNum, limit: limitNum, total,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    set(cacheKey(req), result, CACHE_TTL);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function checkDuplicate(req, res, next) {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Name query param required' });
    const safeName = escapeRegex(name);
    const existing = await Hackathon.findOne({ name: { $regex: `^${safeName}$`, $options: 'i' }, deletedAt: null });
    res.json({ isDuplicate: !!existing });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const cached = get(cacheKey(req));
    if (cached) return res.json(cached);

    const hackathon = await Hackathon.findById(req.params.id).populate('createdBy', 'name email');
    if (!hackathon || hackathon.deletedAt) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }
    await AnalyticsEvent.create({
      hackathon: hackathon._id, type: 'VIEW',
      ip: req.ip, userAgent: req.headers['user-agent'],
    });

    set(cacheKey(req), hackathon, CACHE_TTL);
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

function invalidateCache() {
  flush('hackathons:');
}

export async function create(req, res, next) {
  try {
    const hackathon = await Hackathon.create({ ...req.body, createdBy: req.user.id });
    invalidateCache();
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
    invalidateCache();
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
    invalidateCache();
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
    invalidateCache();
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

// Recycle bin

export async function listDeleted(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { deletedAt: { $ne: null } };
    const total = await Hackathon.countDocuments(filter);
    const hackathons = await Hackathon.find(filter)
      .sort({ deletedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      data: hackathons,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function restore(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Not found' });
    hackathon.deletedAt = null;
    hackathon.status = 'UPCOMING';
    await hackathon.save();
    invalidateCache();
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
}

export async function permanentDelete(req, res, next) {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Not found' });
    invalidateCache();
    res.json({ message: 'Hackathon permanently deleted' });
  } catch (err) {
    next(err);
  }
}
