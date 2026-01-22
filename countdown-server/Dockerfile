FROM node:20-slim

# Native deps for canvas + gifencoder
RUN apt-get update && apt-get install -y \
  build-essential \
  python3 \
  pkg-config \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
