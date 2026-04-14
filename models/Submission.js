const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  score: { type: Number, required: true },
  topic: { type: String, default: '' },
  difficulty: { type: String, default: '' },
  totalQuestions: { type: Number, default: 0 },
  // For AI quizzes — store full question+answer data for review
  reviewData: [
    {
      question: String,
      options: [String],
      correct_answer: String,
      user_answer: String,
      is_correct: Boolean,
      explanation: String,
    }
  ],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema); 