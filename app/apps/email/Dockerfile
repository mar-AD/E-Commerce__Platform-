FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

#CMD ["npm", "run", "start:dev email"]
CMD ["node", "dist/apps/email/src/main"]