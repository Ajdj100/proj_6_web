FROM node:lts-alpine3.19
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]