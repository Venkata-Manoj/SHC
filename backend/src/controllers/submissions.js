import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Filter from 'bad-words';

const filter = new Filter();

export async function create(req, res, next) {
  try {
    const { hackathonData, submitterEmail } = req.body;

    const profane = filter.isProfane(
      [hackathonData.name, hackathonData.description, hackathonData.organizer].filter(Boolean).join(' ')
    );

    const duplicate = await Hackathon.findOne({
      name: { $regex: `^${hackathonData.name}$`, $options: 'i' },
      startDate: new Date(hackathonData.startDate),
      deletedAt: null,
    });

    const submission = await Submission.create({
      hackathonData,
      submitter: req.user?.id,
      submitterEmail,
      posterUrl: req.file?.path,
      duplicationWarning: !!duplicate,
      statusHistory: [{ status: 'PENDING', reviewedAt: new Date() }],
    });

    const admins = await User.find({ role: 'ADMIN' }, '_id');
    const notifications = admins.map(a => ({
      type: 'NEW_SUBMISSION',
      message: `New submission: ${hackathonData.name} by ${submitterEmail}`,
      refId: submission._id,
      recipient: a._id,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
}

export async function listPending(req, res, next) {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    const filter = { status };

    if (req.user.role !== 'ADMIN') {
      filter.$or = [
        { submitter: req.user.id },
        { reviewedBy: req.user.id },
      ];
    }

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('submitter', 'name email')
      .populate('reviewedBy', 'name email');

    res.json({
      data: submissions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function review(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNote, hackathonData } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (hackathonData) {
      Object.assign(submission.hackathonData, hackathonData);
    }

    submission.statusHistory.push({
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      note: reviewNote,
    });
    submission.status = status;
    submission.reviewNote = reviewNote;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    if (status === 'APPROVED') {
      await Hackathon.create({
        ...submission.hackathonData,
        createdBy: submission.submitter,
      });
    }

    res.json(submission);
  } catch (err) {
    next(err);
  }
}

export async function bulkReview(req, res, next) {
  try {
    const { ids, status, reviewNote } = req.body;
    const result = await Submission.updateMany(
      { _id: { $in: ids }, status: 'PENDING' },
      { status, reviewNote, reviewedBy: req.user.id, reviewedAt: new Date() }
    );
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
}
