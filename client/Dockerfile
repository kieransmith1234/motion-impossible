FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16-alpine

WORKDIR /app

COPY --from=build /app/build /app/dist

COPY front-end-server.js /app/

RUN npm install express

EXPOSE 3000

CMD ["node", "front-end-server.js"]