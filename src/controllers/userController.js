const User = require('../models/User');
const Contest = require('../models/contest');
const Submission = require('../models/Submission');

// GET participated contests (paid submissions)
exports.getParticipatedContests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find({ participant: req.userId, paymentStatus: 'paid' })
        .populate('contest', 'name slug type deadline status image prize participantsCount winnerDeclared winner')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Submission.countDocuments({ participant: req.userId, paymentStatus: 'paid' }),
    ]);

    res.json({ submissions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET won contests
exports.getWonContests = async (req, res) => {
  try {
    const contests = await Contest.find({ winner: req.userId }).select('name slug type deadline image prize');
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET user profile with stats
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const participated = await Submission.countDocuments({ participant: req.userId, paymentStatus: 'paid' });
    const wins = await Contest.countDocuments({ winner: req.userId });

    res.json({
      user,
      stats: {
        participated,
        wins,
        winPercentage: participated > 0 ? ((wins / participated) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH update profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'photoUrl', 'bio'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-passwordHash');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST submit contest entry
exports.submitContestEntry = async (req, res) => {
  try {
    const { contestId, submissionLink, notes } = req.body;

    const existing = await Submission.findOne({ contest: contestId, participant: req.userId });
    if (!existing) return res.status(400).json({ message: 'You must pay to participate first' });
    if (existing.submissionLink) return res.status(400).json({ message: 'Already submitted' });

    existing.submissionLink = submissionLink;
    existing.notes = notes || '';
    await existing.save();

    res.json({ message: 'Submission received', submission: existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
