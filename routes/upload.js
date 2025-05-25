import express from 'express';
import multer from 'multer';
import { bucket } from '../firebase.js'; // Import the bucket

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        fieldSize: 50 * 1024 * 1024 // For non-file fields
    }
});

router.post('/',
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const file = req.file;
            const fileName = `${Date.now()}_${file.originalname}`;
            const fileRef = bucket.file(`uploads/${fileName}`);

            // Upload to Firebase
            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Generate 10-year URL
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 10);
            const [url] = await fileRef.getSignedUrl({
                action: 'read',
                expires: expires
            });

            res.json({ url });

        } catch (error) {
            console.error('Cloud Run Upload Error:', error);
            res.status(500).json({
                message: 'File upload failed',
                error: error.message
            });
        }
    }
);


export default router;