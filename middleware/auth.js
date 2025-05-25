import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';



export const authMiddleware = async (req, res, next) => {
  const JWT_SECRET = "Binary2716@!~shIttY";

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authorization required');

    const decoded = jwt.verify(token, JWT_SECRET);
    const userRef = db.collection('users').doc(decoded.userId);
    const doc = await userRef.get();

    if (!doc.exists) throw new Error('User not found');

    req.user = doc.data();
    req.token = token;
    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: error.message || 'Authentication failed' });
  }
};

export const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Access denied. Insufficient permissions.'
    });
  }
  next();
};