FROM node:lts

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . ./

CMD ["npm", "run", "dev", "--", "--host", "--port=5173"]
