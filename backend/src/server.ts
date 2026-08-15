import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';

dotenv.config();

const app = express();
app.use(cors());

// WAJIB DI SINI POSISINYA (Sebelum Routes!)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Daftarkan Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});