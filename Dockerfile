FROM node:20-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copy full project
COPY . .

ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev && npm cache clean --force

EXPOSE 1337

CMD ["npm", "start"]

