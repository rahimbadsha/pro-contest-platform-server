const Contest = require('../models/contest');

// Create contest
exports.createContest = async (req, res) => {
  try {
    const { name, description, price, prize, task, type, deadline, image } = req.body;

    // Basic validation
    if (!name || !description || !price || !deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const contest = new Contest({
      name,
      description,
      price,
      prize,
      task,
      type,
      deadline,
      image,
      creator: req.userId, // comes from verifyToken middleware
    });

    const savedContest = await contest.save();
    res.status(201).json({ message: 'Contest created successfully', contest: savedContest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
