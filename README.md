### 🕵️‍♂️ Blunder Hunter

**Blunder Hunter** is a chess puzzle extractor that digs through your games and finds those *"oops!"* moments that turned into brilliant tactics. Whether you’re blundering your queen or pulling off a lucky mate-in-two, Blunder Hunter is here to spotlight the chaos and turn your games into training gold.

#### ♟️ Features

* 🔍 Analyzes your games (PGN format) and extracts tactical moments
* 🎯 Finds missed wins, blunders, and cool combos using engine analysis
* 🧠 Converts critical positions into interactive puzzles
* 📈 Track your tactical patterns and common mistakes over time
* 🧩 Export puzzles to share or train on later

#### 💡 Why?

Because every chess game is full of hidden gems—and a few embarrassing blunders. Blunder Hunter helps you turn pain into gain.

#### 🚧 Tech Stack

* JavaScript
* Node.js for PGN parsing and engine integration
* Stockfish for analysis

#### 📂 How to Use

1. Upload your PGN file(s)
2. Let Blunder Hunter analyze the games
3. Review and solve the found puzzles
4. Laugh (or cry) at your blunders—and improve!

#### 🔧 How to deploy

https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html

```sh
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 124355670858.dkr.ecr.eu-central-1.amazonaws.com
docker buildx build --platform linux/amd64 --provenance=false -t docker-image:test .
docker tag docker-image:test 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest
docker push 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest
```

Create role
```sh
aws iam create-role \
  --role-name lambda-ex \
  --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

Create lambda
```sh
aws lambda create-function \
--function-name hello-world \
--package-type Image \
--code ImageUri=124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest \
--role arn:aws:iam::124355670858:role/lambda-ex
```

Update lambda
```sh
aws lambda update-function-code \
--function-name hello-world \
--image-uri 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest \
--publish
```

Invoke lambda

```sh
aws lambda invoke \
  --function-name hello-world \
  --cli-read-timeout 900 \
  --payload "$(base64 < event2.json)" \
  response.json
```

Create SQS queue
```sh
aws sqs create-queue --queue-name chess-games-to-create-puzzles-from
```

Get SQS ARN and URL (e.g. https://sqs.eu-central-1.amazonaws.com/124355670858/chess-games-to-create-puzzles-from)
```sh
QUEUE_URL=$(aws sqs get-queue-url --queue-name chess-games-to-create-puzzles-from --query 'QueueUrl' --output text)
QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url $QUEUE_URL --attribute-name QueueArn --query 'Attributes.QueueArn' --output text)
```

Increase the SQS queue's visibility timeout

```sh
aws sqs set-queue-attributes \
  --queue-url https://sqs.eu-central-1.amazonaws.com/124355670858/chess-games-to-create-puzzles-from \
  --attributes VisibilityTimeout=900
```

Add Permission for SQS to Invoke Lambda

```sh
aws lambda add-permission \
  --function-name hello-world \
  --statement-id sqs-invoke \
  --action "lambda:InvokeFunction" \
  --principal sqs.amazonaws.com \
  --source-arn $QUEUE_ARN
```

Allow lambda to 

```sh
aws iam put-role-policy \
  --role-name lambda-ex \
  --policy-name AllowSQSAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        "Resource": "arn:aws:sqs:eu-central-1:124355670858:chess-games-to-create-puzzles-from"
      }
    ]
  }'
```

Create Event Source Mapping

```sh
aws lambda create-event-source-mapping \
  --function-name hello-world \
  --event-source-arn $QUEUE_ARN \
  --batch-size 1 \
  --enabled
```
