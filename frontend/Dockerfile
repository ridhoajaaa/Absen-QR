FROM node:18-bullseye-slim
WORKDIR /app

# copy package files first for docker layer caching
COPY package*.json ./

# install deps; pakai legacy-peer-deps untuk mengurangi kemungkinan konflik peer deps
RUN npm install --legacy-peer-deps --silent --no-audit --progress=false

# copy rest of source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]