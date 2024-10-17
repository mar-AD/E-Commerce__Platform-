FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .
RUN mkdir -p ./dist/proto
COPY ./proto/*.proto ./dist/auth/proto/

EXPOSE 50051

CMD ["npm", "run", "start:dev auth"]

#CMD ["npm", "run", "test"]