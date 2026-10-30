FROM node:22-alpine

WORKDIR /app

COPY services/api-gateway/package*.json ./services/api-gateway/

WORKDIR /app/services/api-gateway

RUN npm install --omit=dev

WORKDIR /app

COPY services/api-gateway/ ./services/api-gateway/
COPY proto/ ./proto/

WORKDIR /app/services/api-gateway

EXPOSE 3000

CMD ["node", "src/server.js"]