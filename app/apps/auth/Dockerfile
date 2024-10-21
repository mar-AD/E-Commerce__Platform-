FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

#RUN npm run build
#
#RUN cp -r ./proto ./dist/proto

EXPOSE 50051

CMD ["npm", "run", "start:dev auth"]

#CMD ["npm", "run", "test"]