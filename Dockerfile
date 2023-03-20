FROM node:12-alpine

RUN npm i -g openapi-to-s3@1.2.1

ENTRYPOINT [ "api2s3" ]
