FROM node:8

# Set the working directory to /app
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

# Make port 80 available to the world outside this container
EXPOSE 80

CMD ["node", "main.js"]