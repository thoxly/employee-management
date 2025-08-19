FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Expose port
EXPOSE 3004

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3004

# Start the application in production mode
CMD ["npm", "start"] 