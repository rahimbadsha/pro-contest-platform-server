const Contest = require('../models/contest');
const Submission = require('../models/Submission');
const User = require('../models/User');

// GET creator's own contests with pagination
exports.getMyContests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [contests, total] = await Promise.all([
      Contest.find({ creator: req.userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Contest.countDocuments({ creator: req.userId }),
    ]);

    res.json({ contests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH update own contest (only if pending/rejected, not approved)
exports.updateContest = async (req, res) => {
  try {
    const contest = await Contest.findOne({ _id: req.params.id, creator: req.userId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status === 'approved') {
      return res.status(400).json({ message: 'Cannot edit an approved contest' });
    }

    const allowed = ['name', 'description', 'price', 'prize', 'task', 'type', 'tags', 'deadline', 'image'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) contest[field] = req.body[field];
    });

    const updated = await contest.save();
    res.json({ message: 'Contest updated', contest: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE own contest
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findOneAndDelete({ _id: req.params.id, creator: req.userId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    await Submission.deleteMany({ contest: req.params.id });
    res.json({ message: 'Contest deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET submissions for a contest owned by creator
exports.getSubmissions = async (req, res) => {
  try {
    const contest = await Contest.findOne({ _id: req.params.contestId, creator: req.userId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find({ contest: req.params.contestId })
        .populate('participant', 'name email photoUrl')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Submission.countDocuments({ contest: req.params.contestId }),
    ]);

    res.json({ submissions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST declare winner for a contest
exports.declareWinner = async (req, res) => {
  try {
    const { submissionId } = req.body;

    const contest = await Contest.findOne({ _id: req.params.contestId, creator: req.userId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.winnerDeclared) return res.status(400).json({ message: 'Winner already declared' });

    const submission = await Submission.findOne({ _id: submissionId, contest: contest._id });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Mark submission as winner
    await Submission.updateMany({ contest: contest._id }, { isWinner: false });
    submission.isWinner = true;
    await submission.save();

    // Update contest
    contest.winner = submission.participant;
    contest.winnerDeclared = true;
    contest.status = 'ended';
    await contest.save();

    // Increment user wins
    await User.findByIdAndUpdate(submission.participant, { $inc: { wins: 1 } });

    res.json({ message: 'Winner declared', winner: submission.participant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
