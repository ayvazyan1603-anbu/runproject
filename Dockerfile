FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies (including tsx and express)
RUN npm install

# Copy source code
COPY . .

# Expose Express server port
EXPOSE 3001

# Start the Express API server
CMD ["npx", "tsx", "server/index.ts"]
