const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const { connectToDB, getDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
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
        console.error(error);
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
    const sortedData = sortObject(data);
    const stringToHash = JSON.stringify(sortedData);
    return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

app.get('/', (req, res) => {
    res.json({ message: 'CertiSure Backend is running!' });
});

app.post('/api/create-record', async (req, res) => {
    try {
        const { certificateData } = req.body;
        if (!certificateData) {
            return res.status(400).json({ message: 'Certificate data is required.' });
        }
        const dataHash = createStableHash(certificateData);
        const db = getDB();
        const existing = await db.collection('certificates').findOne({ dataHash: dataHash });
        if (existing) {
            return res.status(409).json({ message: 'This certificate already exists in the database.' });
        }
        await db.collection('certificates').insertOne({ ...certificateData, dataHash });
        res.status(201).json({ message: 'Certificate record created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/verify-record', async (req, res) => {
    try {
        const { dataHash } = req.body;
        if (!dataHash) {
            return res.status(400).json({ message: 'Data hash is required.' });
        }
        const db = getDB();
        const foundCertificate = await db.collection('certificates').findOne({ dataHash: dataHash });
        if (foundCertificate) {
            const { _id, dataHash, ...certDetails } = foundCertificate;
            res.status(200).json({ verified: true, certificate: certDetails });
        } else {
            res.status(404).json({ verified: false, message: 'Verification Failed: Certificate not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = app;

if (require.main === module) {
    connectToDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}