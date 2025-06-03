1. Create a deployment package (ZIP)

```sh
zip function.zip index.js
```

2. Create a bucket
```sh
aws s3 mb s3://chess-games-to-analyzes-for-puzzles-38gds34lv
```

3. Create role
```sh
aws iam create-role \
  --role-name lambda-s3-to-sqs-role \
  --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

4. Attach policy
```sh
aws iam put-role-policy \
  --role-name lambda-s3-to-sqs-role \
  --policy-name LambdaS3SQSPolicy \
  --policy-document file://permissions-policy.json

```

5. Create the Lambda function via CLI
```sh
aws lambda create-function \
  --function-name push-games-to-sqs \
  --runtime nodejs22.x \
  --role arn:aws:iam::124355670858:role/lambda-s3-to-sqs-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --region eu-central-1
```

6. Add Permission for S3 to Invoke Your Lambda
```sh
aws lambda add-permission \
  --function-name push-games-to-sqs \
  --statement-id s3invoke \
  --action "lambda:InvokeFunction" \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::chess-games-to-analyzes-for-puzzles-38gds34lv
```

7. Configure S3 Event Notification to Trigger Lambda
```sh
aws s3api put-bucket-notification-configuration \
  --bucket chess-games-to-analyzes-for-puzzles-38gds34lv \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [
      {
        "LambdaFunctionArn": "arn:aws:lambda:eu-central-1:124355670858:function:push-games-to-sqs",
        "Events": ["s3:ObjectCreated:*"]
      }
    ]
  }'
```

8. Update function if needed
```sh
zip function.zip index.js
aws lambda update-function-code \
--function-name push-games-to-sqs \
--zip-file fileb://function.zip
```
