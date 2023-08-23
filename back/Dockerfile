# dev
FROM node:16.10.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow
ENV NODE_PATH /opt/server/node_modules

WORKDIR /opt/server/

CMD [ "sh", "-c", "npm run start:dev" ]

# production
FROM node:16.10.0-alpine AS production
RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow
ENV NODE_PATH /opt/server/node_modules

WORKDIR /opt/server/

COPY . .
RUN npm i

CMD ["sh", "-c", "npm run build; npm run start:prod"]