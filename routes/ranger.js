
import express from 'express';
import { db } from '../firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const JWT_SECRET = "Binary2716@!~shIttY";

router.get('/', authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'ranger')
            .get();

        const rangers = snapshot.docs.map(doc => {
            const data = doc.data();
            const { password, ...rangerData } = data;
            return rangerData;
        });

        res.json({ rangers });
    } catch (error) {
        console.error('Error fetching rangers:', error);
        res.status(500).json({ message: 'Failed to fetch rangers' });
    }
});

router.get('/nearby', authMiddleware, async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query; 

        const snapshot = await db.collection('users')
            .where('role', '==', 'ranger')
            .get();

        const nearbyRangers = snapshot.docs
            .map(doc => doc.data())
            .filter(ranger => {
                if (!ranger.location) return false;
                return calculateDistance(
                    parseFloat(latitude),
                    parseFloat(longitude),
                    ranger.location.latitude,
                    ranger.location.longitude
                ) <= radius;
            })
            .map(({ password, ...ranger }) => ranger);

        res.json({ rangers: nearbyRangers });
    } catch (error) {
        console.error('Error fetching nearby rangers:', error);
        res.status(500).json({ message: 'Failed to fetch nearby rangers' });
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default router;