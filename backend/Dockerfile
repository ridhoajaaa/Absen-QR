FROM node:18-bullseye-slim
WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ build-essential && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps --production --silent --no-audit --progress=false

COPY . .
EXPOSE 4000
CMD ["node", "src/app.js"]