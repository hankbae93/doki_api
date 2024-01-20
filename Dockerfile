FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .
COPY .env ./

RUN npm run build

EXPOSE 8000

CMD npm run start:prod