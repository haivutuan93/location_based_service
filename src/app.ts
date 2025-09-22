import express from 'express';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/authRoutes';
import placeRoutes from './routes/placeRoutes';
import userRoutes from './routes/userRoutes';
import { loggingMiddleware } from './middlewares/loggingMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(loggingMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/users', userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => console.error('DB connection error:', error));