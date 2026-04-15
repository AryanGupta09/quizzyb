// dotenv only for local development
try { require('dotenv').config(); } catch(e) {}

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

console.log('ENV CHECK - MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('ENV CHECK - JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('ENV CHECK - NODE_ENV:', process.env.NODE_ENV);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
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

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI not found in environment');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });
