const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { connectToDB, getDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

const corsOptions = {
    origin: function (origin, callback) { callback(null, true); },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (error) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

function createStableHash(data) {
    const sortObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        return Object.keys(obj).sort().reduce((acc, key) => {
            acc[key] = sortObject(obj[key]);
            return acc;
        }, {});
    };
    return crypto.createHash('sha256').update(JSON.stringify(sortObject(data))).digest('hex');
}

async function hashFileBuffer(buffer, mimetype) {
    let normalizedBuffer = buffer;
    if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
        normalizedBuffer = await sharp(buffer).removeMetadata().toBuffer();
    }
    return crypto.createHash('sha256').update(normalizedBuffer).digest('hex');
}

app.get('/', (req, res) => {
    res.json({ message: 'MediSure Backend is running!' });
});

app.post('/api/create-record', async (req, res) => {
    try {
        const { recordData } = req.body;
        if (!recordData) return res.status(400).json({ message: 'Record data is required.' });
        const dataHash = createStableHash(recordData);
        const db = getDB();
        const existing = await db.collection('medical_records').findOne({ dataHash });
        if (existing) return res.status(409).json({ message: 'This record already exists.' });
        await db.collection('medical_records').insertOne({ ...recordData, dataHash, mode: 'basic' });
        res.status(201).json({ message: 'Medical record created successfully.', dataHash });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/verify-record', async (req, res) => {
    try {
        const { dataHash } = req.body;
        if (!dataHash) return res.status(400).json({ message: 'Data hash is required.' });
        const db = getDB();
        const found = await db.collection('medical_records').findOne({ dataHash });
        if (found) {
            const { _id, dataHash: _, mode, ...details } = found;
            res.status(200).json({ verified: true, record: details });
        } else {
            res.status(404).json({ verified: false, message: 'Verification Failed: Record not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/create-record-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File is required.' });
        if (!req.body.recordData) return res.status(400).json({ message: 'Record data is required.' });
        const parsedData = JSON.parse(req.body.recordData);
        const fileHash = await hashFileBuffer(req.file.buffer, req.file.mimetype);
        const db = getDB();
        const existing = await db.collection('medical_records').findOne({ fileHash });
        if (existing) return res.status(409).json({ message: 'This file record already exists.' });
        await db.collection('medical_records').insertOne({ ...parsedData, fileHash, mode: 'mint' });
        res.status(201).json({ message: 'Mint record created successfully.', fileHash });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/verify-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File is required.' });
        const fileHash = await hashFileBuffer(req.file.buffer, req.file.mimetype);
        const db = getDB();
        const found = await db.collection('medical_records').findOne({ fileHash, mode: 'mint' });
        if (found) {
            const { _id, fileHash: _, mode, ...details } = found;
            res.status(200).json({ verified: true, record: details });
        } else {
            res.status(404).json({ verified: false, message: 'Tampered or unregistered file detected.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = app;

if (require.main === module) {
    connectToDB().then(() => {
        app.listen(PORT, () => console.log(`MediSure server running on port ${PORT}`));
    });
}