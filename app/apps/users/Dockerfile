FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 50053

CMD ["node", "dist/apps/users/src/main"]
#CMD ["npm", "run", "test"]