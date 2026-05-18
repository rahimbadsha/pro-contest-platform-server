const express = require('express');
const router = express.Router();
const { register, login, googleAuth, refreshToken, logout, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth'); // your JWT auth middleware

// register
router.post('/register', register);

// login
router.post('/login', login);
router.post('/google', googleAuth);

// refresh token (GET)
router.get('/refresh-token', refreshToken);

// logout
router.post('/logout', logout);

// profile (protected)
router.get('/profile', verifyToken, getProfile);

module.exports = router;
