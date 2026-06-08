# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Build-time argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Stage 2: Production Preview ---
FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -S -D nodeuser

# Copy necessary files for 'npm run preview'
# We need node_modules because vite is a devDependency
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Ensure the non-root user owns the /app directory
RUN chown -R nodeuser:nodejs /app

# Switch to the non-root user
USER nodeuser

# Expose the port defined in the preview script (5173)
EXPOSE 5173

# Start the application using Vite's preview mode
CMD ["npm", "run", "preview"]
