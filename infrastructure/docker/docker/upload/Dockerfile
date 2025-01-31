FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SERVICE=upload

EXPOSE 3000

CMD ["node", "dist/services/upload/index.js"]
