FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SERVICE=events

EXPOSE 3002

CMD ["node", "dist/services/events/index.js"]
