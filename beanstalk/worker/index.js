const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });
const s3 = new AWS.S3({ region: 'us-east-1' });

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const BUCKET = process.env.S3_BUCKET;

async function pollQueue() {
    const res = await sqs.receiveMessage({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
    }).promise();

    if (res.Messages) {
        for (const message of res.Messages) {
            const payload = JSON.parse(message.Body);
            const timestamp = new Date().toISOString();
            const key = `msg-${timestamp}.json`;

            await s3.putObject({
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify({ receivedAt: timestamp, payload }),
                ContentType: 'application/json'
            }).promise();

            await sqs.deleteMessage({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle
            }).promise();

            console.log(`Processed and deleted message: ${key}`);
        }
    }
}

setInterval(pollQueue, 5000);
