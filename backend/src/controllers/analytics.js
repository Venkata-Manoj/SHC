import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Hackathon from '../models/Hackathon.js';

export async function getAnalytics(req, res, next) {
  try {
    const { hackathonId, from, to, compare } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const match = { timestamp: dateFilter };
    if (hackathonId) match.hackathon = hackathonId;

    const stats = await AnalyticsEvent.aggregate([
      { $match: match },
      { $group: { _id: { type: '$type', day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } }, count: { $sum: 1 } } },
      { $sort: { '_id.day': 1 } },
    ]);

    const totals = await AnalyticsEvent.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    let comparison = null;
    if (compare) {
      const compareDate = new Date(from);
      const compareEnd = new Date(to);
      const rangeMs = compareEnd.getTime() - compareDate.getTime();
      compareDate.setTime(compareDate.getTime() - rangeMs);
      compareEnd.setTime(compareEnd.getTime() - rangeMs);

      comparison = await AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: compareDate, $lte: compareEnd } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);
    }

    const hackathons = await Hackathon.countDocuments({ deletedAt: null });
    const totalViews = totals.find(t => t._id === 'VIEW')?.count || 0;
    const totalClicks = totals.find(t => t._id === 'CLICK')?.count || 0;

    res.json({
      totals: { hackathons, views: totalViews, clicks: totalClicks },
      trends: stats,
      comparison,
    });
  } catch (err) {
    next(err);
  }
}

export async function trackClick(req, res, next) {
  try {
    await AnalyticsEvent.create({
      hackathon: req.params.id, type: 'CLICK',
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    res.json({ tracked: true });
  } catch (err) {
    next(err);
  }
}

export async function exportCSV(req, res, next) {
  try {
    const { hackathonId, from, to } = req.query;
    const match = {};
    if (hackathonId) match.hackathon = hackathonId;
    if (from) match.timestamp = { $gte: new Date(from) };
    if (to) match.timestamp = { ...match.timestamp, $lte: new Date(to) };

    const events = await AnalyticsEvent.find(match)
      .populate('hackathon', 'name')
      .sort({ timestamp: -1 })
      .lean();

    const header = 'Date,Hackathon,Type,IP\n';
    const rows = events.map(e =>
      `${e.timestamp?.toISOString()},${e.hackathon?.name || 'Unknown'},${e.type},${e.ip || ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
}
