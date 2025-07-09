const express = require('express');
const AWS = require('aws-sdk');

const app = express();
const s3 = new AWS.S3({ region: 'us-east-1' });

const BUCKET = process.env.S3_BUCKET;

app.use(express.json());

app.post('/', async (req, res) => {
    try {
        const payload = req.body;
        const timestamp = new Date().toISOString();
        const key = `msg-${timestamp}.json`;

        await s3.putObject({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify({ receivedAt: timestamp, payload }),
            ContentType: 'application/json'
        }).promise();

        console.log(`Stored message: ${key}`);
        res.status(200).send('OK');
    } catch (err) {
        console.error('Error processing message:', err);
        res.status(500).send('Failed to process');
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Worker app listening on port ${PORT}`));
