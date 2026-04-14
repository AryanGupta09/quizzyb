const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  category: { type: String },
  difficulty: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema); 