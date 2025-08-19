FROM node:18-alpine

WORKDIR /app

# Add a .npmrc file to ensure we use the correct registry
RUN echo "registry=https://registry.npmjs.org/" > .npmrc

# Copy all files first
COPY . .

# Install dependencies
RUN npm install --only=production

# Build the application for production
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"] 
