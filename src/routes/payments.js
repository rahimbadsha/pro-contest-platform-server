const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Contest = require('../models/contest');
const Submission = require('../models/Submission');
const { verifyToken } = require('../middlewares/auth');

// Create Stripe checkout session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { contestId } = req.body;
    const userEmail = req.user.email;
    const userId = req.user.id;

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status !== 'approved') return res.status(400).json({ message: 'Contest not available' });

    // Check if already paid
    const existing = await Submission.findOne({ contest: contestId, participant: userId, paymentStatus: 'paid' });
    if (existing) return res.status(400).json({ message: 'Already registered for this contest' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: contest.name },
            unit_amount: Math.round(contest.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail,
      metadata: { contestId: contestId.toString(), userId: userId.toString() },
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&contestId=${contestId}`,
      cancel_url: `${process.env.CLIENT_URL}/contests/${contest.slug}`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
