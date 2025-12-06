const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  price: { type: Number, default: 0 }, // entry fee
  prize: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  participantsCount: { type: Number, default: 0 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
