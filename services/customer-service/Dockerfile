
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY services/customer-service/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy source code và các file cấu hình
COPY services/customer-service/ ./

# Copy shared proto
COPY proto/ ./proto/

CMD ["npm", "run", "grpc"]
