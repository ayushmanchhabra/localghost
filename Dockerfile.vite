FROM node:22-slim@sha256:221ee67425de7a3c11ce4e81e63e50caaec82ede3a7d34599ab20e59d29a0cb5
WORKDIR /app/stonks
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev:vite"]
