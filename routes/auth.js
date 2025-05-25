// routes/auth.js
import express from 'express';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, FieldValue } from '../firebase.js';
import { generateUserId } from '../utils.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const JWT_SECRET = "Binary2716@!~shIttY";

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, address, role = 'user' } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check existing email
        const emailQuery = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!emailQuery.empty) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate and verify unique userID
        const userId = generateUserId();
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(500).json({ message: 'ID generation conflict' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user document
        await userRef.set({
            userId,
            name,
            email,
            phone,
            address,
            role,
            displayProfile: req.body.displayProfile || '',
            password: hashedPassword,
            createdAt: FieldValue.serverTimestamp()
        });

        // Generate JWT
        const token = jwt.sign(
            { userId, role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered',
            user: { userId, name, email, role },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/rangers',
    authMiddleware,
    // roleMiddleware(['admin']), // Only admins can add rangers
    async (req, res) => {
        try {
            const {
                name,
                email,
                password,
                phone,
                location,
                assignedArea,
                badgeNumber
            } = req.body;

            // Validate required fields
            if (!name || !email || !password || !phone) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Check if email exists
            const emailExists = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (!emailExists.empty) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Check if badge number exists (if provided)
            if (badgeNumber) {
                const badgeExists = await db.collection('users')
                    .where('badgeNumber', '==', badgeNumber)
                    .limit(1)
                    .get();

                if (!badgeExists.empty) {
                    return res.status(400).json({ message: 'Badge number already in use' });
                }
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create ranger object
            const rangerData = {
                userId: generateUserId(),
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'ranger',
                location: location || null,
                assignedArea: assignedArea || '',
                badgeNumber: badgeNumber || '',
                displayProfile: req.body.displayProfile || '',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            };

            // Save to Firestore
            await db.collection('users').doc(rangerData.userId).set(rangerData);

            // Remove password before sending response
            const { password: _, ...createdRanger } = rangerData;

            res.status(201).json({
                message: 'Ranger added successfully',
                ranger: createdRanger
            });

        } catch (error) {
            console.error('Error adding ranger:', error);
            res.status(500).json({ message: 'Failed to add ranger' });
        }
    }
);

export default router;