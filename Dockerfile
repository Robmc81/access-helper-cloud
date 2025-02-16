
# Development stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle version conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port for development
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
