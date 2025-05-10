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
  --payload "$(base64 < event.json)" \
  response.json
```
