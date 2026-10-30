
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY services/payment-service/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy toàn bộ Payment Service
COPY services/payment-service/ ./

# Copy shared proto
COPY proto/ ./proto/

EXPOSE 50057

CMD ["npm", "run", "grpc"]
