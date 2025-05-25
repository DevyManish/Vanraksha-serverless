import express from 'express';
import { db, FieldValue } from '../firebase.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['admin']));

// 1. Get all reports
router.get('/reports', async (req, res) => {
    try {
        const snapshot = await db.collection('reports')
            .orderBy('createdAt', 'desc')
            .get();

        const reports = snapshot.docs.map(doc => doc.data());
        res.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

// 2. Get all employees (users + rangers)
router.get('/employees', async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', 'in', ['ranger', 'user'])
            .get();

        const employees = snapshot.docs.map(doc => {
            const { password, ...data } = doc.data();
            return data;
        });

        res.json({ employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Failed to fetch employees' });
    }
});

// 3. Create fundraiser
router.post('/fundraisers', async (req, res) => {
    try {
        const {
            title,
            description,
            targetAmount,
            startDate,
            endDate
        } = req.body;

        if (!title || !description || !targetAmount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const fundraiserId = uuidv4();
        const fundraiserData = {
            fundraiserId,
            title,
            description,
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            startDate: startDate || FieldValue.serverTimestamp(),
            endDate,
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        await db.collection('fundraisers').doc(fundraiserId).set(fundraiserData);

        res.status(201).json({
            message: 'Fundraiser created successfully',
            fundraiser: fundraiserData
        });
    } catch (error) {
        console.error('Error creating fundraiser:', error);
        res.status(500).json({ message: 'Failed to create fundraiser' });
    }
});

// get funds

router.get('/fundraisers', async (req, res) => {
    try {
        const snapshot = await db.collection('fundraisers')
            .orderBy('createdAt', 'desc')
            .get();

        const fundraisers = snapshot.docs.map(doc => {
            const data = doc.data();
            // Add progress percentage
            data.progress = ((data.currentAmount / data.targetAmount) * 100).toFixed(2);
            return data;
        });

        res.json({ fundraisers });
    } catch (error) {
        console.error('Error fetching fundraisers:', error);
        res.status(500).json({ message: 'Failed to fetch fundraisers' });
    }
});

export default router;