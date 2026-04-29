const express = require('express');
const router = express.Router();
const Contest = require('../models/contest');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// GET all approved contests with search, type filter, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, search } = req.query;

    const query = { status: 'approved' };
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    const [contests, total] = await Promise.all([
      Contest.find(query)
        .populate('creator', 'name photoUrl')
        .populate('winner', 'name photoUrl')
        .sort({ participantsCount: -1 })
        .skip(skip)
        .limit(limit),
      Contest.countDocuments(query),
    ]);

    res.json({ contests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET popular contests (top 6 by participants)
router.get('/popular', async (req, res) => {
  try {
    const contests = await Contest.find({ status: 'approved' })
      .populate('creator', 'name photoUrl')
      .populate('winner', 'name photoUrl')
      .sort({ participantsCount: -1 })
      .limit(6);
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET recent winners (contests with winner declared)
router.get('/winners', async (req, res) => {
  try {
    const contests = await Contest.find({ winnerDeclared: true })
      .populate('winner', 'name photoUrl email')
      .populate('creator', 'name')
      .sort({ updatedAt: -1 })
      .limit(6);
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET contest by ID
router.get('/id/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('creator', 'name photoUrl email')
      .populate('winner', 'name photoUrl');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET contest by slug
router.get('/:slug', async (req, res) => {
  try {
    const contest = await Contest.findOne({ slug: req.params.slug, status: 'approved' })
      .populate('creator', 'name photoUrl email')
      .populate('winner', 'name photoUrl');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
