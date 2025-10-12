# Start from Amazon Linux 2023 base for Lambda compatibility
FROM public.ecr.aws/lambda/nodejs:22

COPY stockfish ${LAMBDA_TASK_ROOT}

RUN chmod +x ${LAMBDA_TASK_ROOT}

# Copy function code
COPY index.js ${LAMBDA_TASK_ROOT}
COPY utils.js ${LAMBDA_TASK_ROOT}

COPY package.json package-lock.json ./
RUN npm ci

# Set the Lambda handler
CMD [ "index.handler" ]
