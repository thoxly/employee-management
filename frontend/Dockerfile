FROM node:18-alpine

WORKDIR /app

# Add a .npmrc file to ensure we use the correct registry
RUN echo "registry=https://registry.npmjs.org/" > .npmrc

# Copy all files first
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Build the application for production
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"] 
