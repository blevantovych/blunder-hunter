const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const s3 = new S3Client({ region: 'eu-central-1' });
const sqs = new SQSClient({ region: 'eu-central-1' });

// const QUEUE_URL = process.env.SQS_QUEUE_URL; // Pass via env var
const QUEUE_URL = 'https://sqs.eu-central-1.amazonaws.com/124355670858/chess-games-to-create-puzzles-from'; // Pass via env var

exports.handler = async (event) => {
  try {
    const record = event.Records[0];
    
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const fileContent = await getS3Object(bucket, key);
    const games = fileContent.split('\n\n\n') // each game is separated by two newlines

    for (const game of games) {
      if (game.trim().length > 0) {
        const command = new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify({
            pgn: game
          }),
        });
        await sqs.send(command);
      }
    }

    console.log(`Sent ${games.length} SQS messages for s3://${bucket}/${key}`);

    return {
      statusCode: 200,
      body: 'Messages sent to SQS'
    };
  } catch (err) {
    console.error('Error processing S3 event:', err);
    throw err;
  }
};


async function getS3Object(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);

  // Read entire body as a string
  const stream = response.Body;
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
