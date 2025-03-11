# Use Node.js 22
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled JS files
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Create a non-root user and switch to it
# Start the application
CMD ["node", "main"]
