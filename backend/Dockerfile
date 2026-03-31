FROM node:25-alpine

# set working directory
WORKDIR /usr/app
COPY . .

RUN yarn install

# start app
CMD ["yarn", "start"]