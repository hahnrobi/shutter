FROM node:17-alpine
WORKDIR /usr/src/shutter
COPY ./certs ./certs/
COPY ./controllers ./controllers/
COPY ./includes ./includes/
COPY ./models ./models/
COPY ./routes ./routes/
COPY ./views ./views/
COPY ./server.js ./
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./public/dist/shutter ./public/dist/shutter/
EXPOSE 4430
RUN npm install -production
CMD [ "node", "server.js" ]