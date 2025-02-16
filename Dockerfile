
# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install Yarn
RUN corepack enable && \
    corepack prepare yarn@stable --activate

# Copy package.json first
COPY package.json ./

# Initialize yarn and install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

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
