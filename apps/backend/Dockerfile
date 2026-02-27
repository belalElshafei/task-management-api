# Use specific version for reproducibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy ALL package.json files for workspace resolution
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Install only production dependencies for the backend workspace
RUN npm ci --workspace=@task-management/backend --omit=dev --no-audit --no-fund

# Copy backend source code
COPY apps/backend ./apps/backend

# Expose the API port
EXPOSE 5000

# Start command
CMD ["node", "apps/backend/server.js"]
