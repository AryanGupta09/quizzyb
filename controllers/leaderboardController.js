const Submission = require('../models/Submission');
const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    // Get highest score per user
    const topScores = await Submission.aggregate([
      {
        $group: {
          _id: "$user",
          maxScore: { $max: "$score" },
        }
      },
      { $sort: { maxScore: -1 } },
      { $limit: 10 }
    ]);

    // Populate user info
    const leaderboard = await Promise.all(topScores.map(async (entry) => {
      const user = await User.findById(entry._id);
      return {
        userId: entry._id,
        username: user ? user.username : 'Unknown',
        email: user ? user.email : '',
        score: entry.maxScore
      };
    }));

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 