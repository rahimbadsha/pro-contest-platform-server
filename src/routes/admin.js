const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getAllContests,
  updateContestStatus,
  deleteContest,
} = require('../controllers/adminController');

const adminOnly = [verifyToken, authorizeRoles('admin')];

router.get('/users', ...adminOnly, getUsers);
router.patch('/users/:id/role', ...adminOnly, updateUserRole);
router.delete('/users/:id', ...adminOnly, deleteUser);

router.get('/contests', ...adminOnly, getAllContests);
router.patch('/contests/:id/status', ...adminOnly, updateContestStatus);
router.delete('/contests/:id', ...adminOnly, deleteContest);

module.exports = router;
