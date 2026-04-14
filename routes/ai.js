const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../utils/auth');

router.post('/generate-questions', verifyToken, aiController.generateQuestions);
router.post('/get-explanation', verifyToken, aiController.getExplanation);

module.exports = router;
