FROM node

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 50055

CMD ["node", "dist/apps/admins/src/main"]
#CMD ["npm", "run", "test"]