# Start from Amazon Linux 2023 base for Lambda compatibility
FROM public.ecr.aws/lambda/nodejs:22

COPY stockfish /var/task/stockfish

RUN chmod +x /var/task/stockfish

# Copy function code
COPY index.js ${LAMBDA_TASK_ROOT}

COPY package.json package-lock.json ./
RUN npm ci

# Set the Lambda handler
CMD [ "index.handler" ]
