const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    prize: { type: Number, default: 0 },
    task: { type: String },
    type: { type: String, enum: ['image-design', 'article-writing', 'marketing-strategy', 'gaming-review', 'book-review', 'business-idea', 'other'], default: 'other' },
    tags: [{ type: String }],
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'ended'], default: 'pending' },
    participantsCount: { type: Number, default: 0 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    image: { type: String, default: '' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    winnerDeclared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const slugify = require('slugify');

contestSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
});

module.exports = mongoose.model('Contest', contestSchema);
