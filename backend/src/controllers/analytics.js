import PDFDocument from 'pdfkit';
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

export async function exportPDF(req, res, next) {
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

    const totalHackathons = await Hackathon.countDocuments({ deletedAt: null });
    const views = events.filter(e => e.type === 'VIEW').length;
    const clicks = events.filter(e => e.type === 'CLICK').length;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.pdf');
    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold').text('Analytics Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(`Total Hackathons: ${totalHackathons}`);
    doc.text(`Total Views: ${views}`);
    doc.text(`Total Clicks: ${clicks}`);
    doc.moveDown(1.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Recent Events');
    doc.moveDown(0.5);
    const headerY = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 40, headerY, { width: 80 });
    doc.text('Hackathon', 120, headerY, { width: 150 });
    doc.text('Type', 270, headerY, { width: 60 });
    doc.text('IP', 330, headerY, { width: 120 });
    doc.moveDown(0.5);

    const startY = doc.y;
    doc.fontSize(8).font('Helvetica');
    doc.rect(40, headerY - 4, 520, startY - headerY + 4).stroke('#cccccc');

    let y = startY;
    for (const e of events.slice(0, 50)) {
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
      doc.text(e.timestamp?.toISOString?.()?.slice(0, 10) || '-', 40, y, { width: 80 });
      doc.text(e.hackathon?.name || 'Unknown', 120, y, { width: 150 });
      doc.text(e.type, 270, y, { width: 60 });
      doc.text(e.ip || '-', 330, y, { width: 120 });
      y += 16;
    }

    doc.end();
  } catch (err) {
    next(err);
  }
}
