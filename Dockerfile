FROM node:18-alpine

WORKDIR /app

# Salin folder backend
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

WORKDIR /app/backend
RUN npm install
RUN npx prisma generate

# Salin seluruh sisa kode backend
COPY backend/ ./

EXPOSE 5000

CMD ["npx", "tsx", "src/server.ts"]