FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

#RUN npm run build
#
#RUN mkdir -p ./dist/apps/apigateway/proto
#COPY ./proto/auth.proto ./dist/apps/apigateway/proto/

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

#CMD ["npm", "run", "test"]