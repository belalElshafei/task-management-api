# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (context is now apps/frontend)
COPY package*.json ./

# Install dependencies (no more workspace needed)
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Provide NEXT_PUBLIC_API_URL at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# STANDALONE output
# In standalone mode, files are shifted. We need to copy from .next/standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the standalone server
CMD ["node", "server.js"]
