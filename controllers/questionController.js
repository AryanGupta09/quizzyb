const Question = require('../models/Question');

exports.addQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;
    if (!question || !options || options.length < 2 || correctAnswer === undefined) {
      return res.status(400).json({ message: 'Invalid question data' });
    }
    const newQuestion = new Question({ question, options, correctAnswer, category, difficulty });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 