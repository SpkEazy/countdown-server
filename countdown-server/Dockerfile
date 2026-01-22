FROM node:20-slim

# canvas native deps
RUN apt-get update && apt-get install -y \
  libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
