// routes/report.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createReport, getReportsByUser } from '../models/report.js';
import 'dotenv/config';

const router = express.Router();

// Create new report
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const reportData = {
            reporterUserId: userId,
            ...req.body
        };

        const report = await createReport(reportData);
        res.status(201).json({
            message: 'Report created successfully',
            report
        });
    } catch (error) {
        console.error('Report creation error:', error);
        res.status(500).json({ message: 'Failed to create report' });
    }
});

// Get user's reports
router.get('/my-reports', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const reports = await getReportsByUser(userId);
        res.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

export default router;