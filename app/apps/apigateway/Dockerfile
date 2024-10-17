FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .
RUN mkdir -p ./dist/proto
COPY ./proto/*.proto ./dist/apigateway/proto/

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

#CMD ["npm", "run", "test"]