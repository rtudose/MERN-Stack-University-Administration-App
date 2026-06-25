FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -S -D nodeuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 5173

CMD ["npm", "run", "preview"]
