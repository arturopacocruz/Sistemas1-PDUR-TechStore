import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database & Seeds
initDatabase();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TechStore API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[TechStore Server] Running on http://localhost:${PORT}`);
});
