FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build || npx tsc

EXPOSE 8080

CMD ["npm", "start"]
