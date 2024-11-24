FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 50051

#CMD ["npm", "run", "start:dev auth"]

CMD ["node", "dist/apps/auth/src/main"]
#CMD ["npm", "run", "test"]