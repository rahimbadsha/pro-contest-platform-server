const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    isWinner: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    stripeSessionId: { type: String, default: '' },
  },
  { timestamps: true }
);

// One submission per user per contest
submissionSchema.index({ contest: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
