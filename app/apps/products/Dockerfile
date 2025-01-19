FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

CMD ["node", "dist/apps/products/src/main"]