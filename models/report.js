import { db, FieldValue } from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const INCIDENT_TYPES = [
    'SUSPICIOUS_ACTIVITY',
    'WILDLIFE_SIGHTING',
    'ILLEGAL_LOGGING',
    'ANIMAL_CONFLICT'
];

const REPORT_STATUS = [
    'REPORTED',
    'VERIFIED',
    'IN_PROGRESS',
    'RESOLVED'
];

const SEVERITY_LEVELS = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
];

export const createReport = async (reportData) => {
    const reportId = uuidv4();
    const reportRef = db.collection('reports').doc(reportId);

    const report = {
        reportId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: 'REPORTED',
        ...reportData
    };

    await reportRef.set(report);
    return report;
};

export const getReportsByUser = async (userId) => {
    const snapshot = await db.collection('reports')
        .where('reporterUserId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => doc.data());
};