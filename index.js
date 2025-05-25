import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRouter from './routes/auth.js';
import reportRouter from './routes/report.js';
import rangerRouter from './routes/ranger.js';
import adminRouter from './routes/admin.js';
import postRouter from './routes/post.js';
import uploadRouter from './routes/upload.js';
import carbonRouter from './routes/carbon.js';
import { Functions } from 'firebase-admin/functions';

// import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';


const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "https://vanrakshak.vercel.app"],
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/reports', reportRouter);
app.use('/api/rangers', rangerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/posts', postRouter);
app.use('/api/upload', uploadRouter);
app.use('/api', carbonRouter);

// const PORT = process.env.PORT || 8000;
const PORT = 8000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}.`)
);

export const api = onRequest(app);