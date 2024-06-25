FROM node:18

WORKDIR /app

COPY package*.json ./

RUN  npm install -g @nestjs/cli

RUN npm install --production

COPY . .

EXPOSE 8000

CMD ["npm", "run", "start:dev"]
