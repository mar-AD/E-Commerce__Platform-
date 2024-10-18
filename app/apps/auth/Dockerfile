FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

#RUN npm run build
#
#RUN mkdir -p ./dist/apps/auth/proto
#COPY ./proto/auth.proto ./dist/apps/auth/proto/

EXPOSE 50051

CMD ["npm", "run", "start:dev"]

#CMD ["npm", "run", "test"]