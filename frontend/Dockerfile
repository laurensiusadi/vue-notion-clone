FROM node:12-alpine
RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm rebuild node-sass
COPY . .
RUN npm run build
EXPOSE 8080
CMD [ "http-server", "dist" ]
