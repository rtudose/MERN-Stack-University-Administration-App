# --- Stage 1: Build & Prune ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Prune development dependencies
RUN npm prune --production

# --- Stage 2: Production ---
FROM node:18-alpine

# Set to production environment
ENV NODE_ENV=production

WORKDIR /app

# Create a non-root user and group
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -S -D nodeuser

# Copy only the necessary files from the builder stage
COPY --from=builder /app /app

# Ensure the non-root user owns the /app directory
RUN chown -R nodeuser:nodejs /app

# Switch to the non-root user
USER nodeuser

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
