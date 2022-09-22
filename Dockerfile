FROM node:18

WORKDIR /app
COPY . .
RUN rm -rf node_modules
RUN yarn install

CMD ["yarn", "start"]