# Use specific version for reproducibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files (context is now apps/backend)
COPY package*.json ./

# Install only production dependencies
# Use npm install since we are in a flattened subfolder without a local lockfile
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# Copy source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start command
CMD ["node", "server.js"]
