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

// Connect to MongoDB Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

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
