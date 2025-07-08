const express = require('express');
const AWS = require('aws-sdk');
const app = express();
const s3 = new AWS.S3({ region: 'us-east-1' });
const BUCKET = process.env.S3_BUCKET;

app.get('/', async (req, res) => {
    const list = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    const count = list.KeyCount;
    const latest = list.Contents?.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))[0];

    let latestData = null;
    if (latest) {
        const obj = await s3.getObject({ Bucket: BUCKET, Key: latest.Key }).promise();
        latestData = JSON.parse(obj.Body.toString());
    }

    res.send(`
        <h1>Processed Messages: ${count}</h1>
        ${latestData ? `
        <p><strong>Last Message Timestamp:</strong> ${latestData.receivedAt}</p>
        <p><strong>Payload:</strong> ${JSON.stringify(latestData.payload)}</p>
        ` : '<p>No messages yet</p>'}
    `);
});

app.listen(3000, () => console.log('Web app running on port 3000'));
