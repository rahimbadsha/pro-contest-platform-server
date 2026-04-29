const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const {
  getMyContests,
  updateContest,
  deleteContest,
  getSubmissions,
  declareWinner,
} = require('../controllers/creatorController');
const { createContest } = require('../controllers/contestController');

const creatorAuth = [verifyToken, authorizeRoles('creator', 'admin')];

router.get('/my-contests', ...creatorAuth, getMyContests);
router.post('/contests', ...creatorAuth, createContest);
router.patch('/contests/:id', ...creatorAuth, updateContest);
router.delete('/contests/:id', ...creatorAuth, deleteContest);
router.get('/contests/:contestId/submissions', ...creatorAuth, getSubmissions);
router.post('/contests/:contestId/declare-winner', ...creatorAuth, declareWinner);

module.exports = router;
