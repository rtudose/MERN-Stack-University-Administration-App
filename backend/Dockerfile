FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm prune --production

FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -S -D nodeuser

COPY --from=builder /app /app

RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 5000

CMD ["node", "server.js"]
