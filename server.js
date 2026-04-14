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

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/submissions', require('./routes/submission'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/ai',          require('./routes/ai'));

app.get('/', (_req, res) => res.json({ status: 'ok', app: 'Quizzy API' }));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const MONGO = process.env.MONGO_URI;
if (!MONGO) {
  console.error('ERROR: MONGO_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(MONGO, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });
