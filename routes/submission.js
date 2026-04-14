const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken } = require('../utils/auth');

router.post('/submit', verifyToken, submissionController.submitAnswers);
router.post('/save-ai-score', verifyToken, submissionController.saveAiScore);
router.get('/me', verifyToken, submissionController.getMySubmissions);
router.get('/:id', verifyToken, submissionController.getSubmissionById);

module.exports = router; 