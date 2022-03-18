FROM node:16.14.1-alpine

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
