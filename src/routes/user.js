const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  getParticipatedContests,
  getWonContests,
  getProfile,
  updateProfile,
  submitContestEntry,
} = require('../controllers/userController');

router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.get('/participated-contests', verifyToken, getParticipatedContests);
router.get('/won-contests', verifyToken, getWonContests);
router.post('/submit', verifyToken, submitContestEntry);

module.exports = router;
