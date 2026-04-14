const Submission = require('../models/Submission');
const Question = require('../models/Question');

// +5 for correct, -1 for wrong
const SCORE_CORRECT = 5;
const SCORE_WRONG = -1;

exports.submitAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers } = req.body; // { questionId: selectedOptionIndex, ... }
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid answers format' });
    }
    let score = 0;
    const questionIds = Object.keys(answers);
    const questions = await Question.find({ _id: { $in: questionIds } });
    questions.forEach(q => {
      const userAnswer = answers[q._id.toString()];
      if (userAnswer !== undefined && Number(userAnswer) === q.correctAnswer) score += SCORE_CORRECT;
      else score += SCORE_WRONG;
    });
    const submission = new Submission({ user: userId, answers, score });
    await submission.save();
    res.status(201).json({ score, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveAiScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, topic, difficulty, totalQuestions, reviewData } = req.body;
    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'Score is required' });
    }
    const submission = new Submission({
      user: userId,
      answers: {},
      score: Number(score),
      topic: topic || '',
      difficulty: difficulty || '',
      totalQuestions: totalQuestions || 0,
      reviewData: reviewData || [],
    });
    await submission.save();
    res.status(201).json({ score: submission.score, submissionId: submission._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Submission.find({ user: userId }).sort({ submittedAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const submission = await Submission.findOne({ _id: req.params.id, user: userId });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};