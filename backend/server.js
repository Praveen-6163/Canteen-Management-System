import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - allow Vercel, Netlify, and local dev origins
const allowedOrigins = [
  'https://canteen-management-system-chi.vercel.app',
  'https://canteenmanagementsystemai.netlify.app',
  'http://localhost:3000',
  'http://localhost:5001',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow any netlify.app and vercel.app subdomain
    if (origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    res.status(500).json({ message: 'Database connection failed. Please try again in a few moments.' });
  }
});

// API Routes
app.use('/api/users', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);

// Welcome message
app.get('/', (req, res) => {
  res.send('Canteen Management API is running active...');
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the listener if not running in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
}

export default app;
