# Use specific version for reproducibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files (context is now apps/backend)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start command
# We run node server.js directly from the /app root
CMD ["node", "server.js"]
