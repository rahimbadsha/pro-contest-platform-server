const Contest = require('../models/contest.js');
const slugify = require('slugify'); 

exports.createContest = async (req, res) => {
  try {
    const { title, description, tags, price, prize, imageUrl, deadline } = req.body;
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'title, description and deadline are required' });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const newContest = await Contest.create({
      title,
      slug,
      creator: req.user.id, // set by verifyToken
      description,
      tags: tags || [],
      price: price || 0,
      prize: prize || 0,
      imageUrl: imageUrl || '',
      deadline: new Date(deadline),
      status: 'pending',
    });

    res.status(201).json({ message: 'Contest created (pending approval)', contest: newContest });
  } catch (error) {
    console.error('createContest error:', error);
    res.status(500).json({ message: error.message });
  }
};
