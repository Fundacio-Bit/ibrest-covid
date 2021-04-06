FROM node:10.16.0
WORKDIR /usr/src/ibrest-covid
COPY . .
ENV NODE_ENV="production"
RUN npm install --only=prod
EXPOSE 3100
CMD ["node", "server.js"]
