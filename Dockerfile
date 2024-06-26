FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

EXPOSE 8000

CMD ["npm", "run", "start:dev"]
