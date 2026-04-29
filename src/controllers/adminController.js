const User = require('../models/User');
const Contest = require('../models/contest');
const Submission = require('../models/Submission');

// GET all users with pagination
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'creator', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all contests (any status) with pagination
exports.getAllContests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [contests, total] = await Promise.all([
      Contest.find().populate('creator', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Contest.countDocuments(),
    ]);

    res.json({ contests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH contest status (approve / reject)
exports.updateContestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const contest = await Contest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json({ message: 'Contest status updated', contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE contest
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    await Submission.deleteMany({ contest: req.params.id });
    res.json({ message: 'Contest deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
