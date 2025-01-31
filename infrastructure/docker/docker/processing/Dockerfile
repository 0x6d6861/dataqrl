FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SERVICE=processing

EXPOSE 3001

CMD ["node", "dist/services/processing/index.js"]
