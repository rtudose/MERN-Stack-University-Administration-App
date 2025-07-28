# backend/Dockerfile

# --- 1. Build Stage ---
# Use an official Node.js image as the base
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including development ones for potential build steps
RUN npm install

# Copy the rest of your application's source code
COPY . .

# --- 2. Production Stage ---
# Start from a clean, lightweight Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Expose the port the app runs on
EXPOSE 5000

# The command to run your application
CMD [ "node", "server.js" ]