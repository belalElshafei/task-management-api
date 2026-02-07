# Use specific version for reproducibility
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
# basic auth/python/make might be needed for some native modules (bcrypt), 
# but node:20-alpine usually handles pure JS well. 
# If bcrypt fails, we might need to add: RUN apk add --no-cache make gcc g++ python3
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
