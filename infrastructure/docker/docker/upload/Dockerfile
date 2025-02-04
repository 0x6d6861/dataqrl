FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SERVICE=upload
VOLUME ["/app/uploads"]

EXPOSE 3000

CMD ["node", "dist/services/upload/server.js"]
