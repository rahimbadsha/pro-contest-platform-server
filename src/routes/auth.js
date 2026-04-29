const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth'); // your JWT auth middleware

// register
router.post('/register', register);

// login
router.post('/login', login);

// refresh token (GET)
router.get('/refresh-token', refreshToken);

// logout
router.post('/logout', logout);

// profile (protected)
router.get('/profile', verifyToken, getProfile);

module.exports = router;
