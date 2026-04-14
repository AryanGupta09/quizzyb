const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyToken, isAdmin } = require('../utils/auth');

router.post('/add', verifyToken, isAdmin, questionController.addQuestion);
router.get('/', questionController.getQuestions);

module.exports = router; 