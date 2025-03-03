FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 50059

CMD ["node", "dist/apps/orders/src/main"]