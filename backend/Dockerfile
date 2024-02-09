FROM node:lts

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--openssl-legacy-provider"

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
