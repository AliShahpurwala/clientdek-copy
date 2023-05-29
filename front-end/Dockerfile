FROM node:13.12.0-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY ./package.json .
COPY ./package-lock.json .
RUN npm install --silent
RUN npm install react-scripts -g --silent

COPY . .

ARG API_URL
ENV REACT_APP_API_URL $API_URL

ARG ENVIRONMENT
ENV REACT_APP_ENVIRONMENT $ENVIRONMENT

RUN npm run build
CMD ["node", "app.js"]

LABEL org.opencontainers.image.source="https://github.com/ThomasHankins/clientdek"