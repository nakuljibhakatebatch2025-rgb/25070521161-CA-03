import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5174'
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let status = error.status || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource id';
  } else if (error.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  }

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({ message });
});

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment');
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

start();
