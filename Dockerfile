
# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install npm version 10.8.2 globally
RUN npm install -g npm@10.8.2

# Copy package files
COPY package*.json ./

# Install dependencies with force flag
RUN npm install --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
