const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contest = require('../models/contest');

// GET leaderboard - users ranked by wins
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ wins: { $gt: 0 } })
        .select('name email photoUrl wins participated')
        .sort({ wins: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ wins: { $gt: 0 } }),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
