FROM node:12-alpine

RUN npm i -g openapi-to-s3

ENTRYPOINT [ "api2s3" ]
