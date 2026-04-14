require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/submissions', require('./routes/submission'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/ai',          require('./routes/ai'));

app.get('/', (_req, res) => res.json({ status: 'ok', app: 'Quizzy API' }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// MongoDB
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
