FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SERVICE=events

VOLUME ["/app/uploads"]


EXPOSE 3002

CMD ["node", "dist/services/events/server.js"]
