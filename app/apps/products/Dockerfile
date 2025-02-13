FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 50057

CMD ["node", "dist/apps/products/src/main"]