FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY services/auth-service/package*.json ./

# Install dependencies, including devDependencies
RUN npm install

# Copy source code và cấu hình
COPY services/auth-service/ ./

# Copy shared proto
COPY proto/ ./proto/

EXPOSE 50051

CMD ["npm", "run", "grpc"]