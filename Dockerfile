FROM node:16-alpine

WORKDIR /usr/src/app

ADD . /usr/src/app

RUN npm ci

RUN npm run build

EXPOSE 8000

CMD npm run start:prod