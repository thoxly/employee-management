FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3003

# Set environment variable for hot reload on Mac/Windows
ENV CHOKIDAR_USEPOLLING=true

# Start the application with nodemon for development
CMD ["npm", "run", "dev"] 