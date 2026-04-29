require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const admin = require('firebase-admin');

// Firebase Admin init
try {
  const serviceAccount = require('../firebase-service.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Firebase Admin Initialized');
} catch (e) {
  console.warn('Firebase Admin init skipped:', e.message);
}

const app = express();

connectDB();

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', process.env.CLIENT_URL || 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/payment', require('./routes/payments'));
app.use('/api/payment-success', require('./routes/payment-success'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/creator', require('./routes/creator'));
app.use('/api/user', require('./routes/user'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

app.get('/', (req, res) => res.send('ContestHub server running...'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
