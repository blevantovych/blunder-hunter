#!/usr/bin/env bash

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 124355670858.dkr.ecr.eu-central-1.amazonaws.com
docker buildx build --platform linux/amd64 --provenance=false -t docker-image:test .
docker tag docker-image:test 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest
docker push 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest

aws lambda update-function-code \
--function-name hello-world \
--image-uri 124355670858.dkr.ecr.eu-central-1.amazonaws.com/hello-world:latest \
--publish > /dev/null

# echo "Waiting for 15 seconds"
# sleep 15
# echo "Calling lambda"
#
# aws lambda invoke \
#   --function-name hello-world \
#   --cli-read-timeout 900 \
#   --payload "$(base64 < event2.json)" \
#   response.json
