const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Contest = require('../models/contest');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth');

// Confirm payment and register participant
router.post('/', verifyToken, async (req, res) => {
  try {
    const { sessionId, contestId } = req.body;
    const userId = req.user.id;

    // Verify stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Idempotent: check if already registered
    let submission = await Submission.findOne({ contest: contestId, participant: userId });
    if (submission && submission.paymentStatus === 'paid') {
      return res.json({ message: 'Already registered', submission });
    }

    if (submission) {
      submission.paymentStatus = 'paid';
      submission.stripeSessionId = sessionId;
      await submission.save();
    } else {
      submission = await Submission.create({
        contest: contestId,
        participant: userId,
        submissionLink: '',
        paymentStatus: 'paid',
        stripeSessionId: sessionId,
      });
    }

    // Increment contest participants if not already counted
    if (!contest.participants.includes(userId)) {
      contest.participants.push(userId);
      contest.participantsCount += 1;
      await contest.save();
    }

    // Increment user participated count
    await User.findByIdAndUpdate(userId, { $inc: { participated: 1 } });

    res.json({ message: 'Registration confirmed', submission });
  } catch (err) {
    console.error('Payment success error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
