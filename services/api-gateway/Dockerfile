
FROM node:22-alpine

WORKDIR /app

# Copy package files trước để tận dụng Docker cache
COPY services/api-gateway/package*.json ./

RUN npm install --omit=dev

# Copy source code API Gateway
COPY services/api-gateway/ ./

# Copy shared proto definitions
COPY proto/ ./proto/

EXPOSE 3000

CMD ["node", "src/server.js"]
