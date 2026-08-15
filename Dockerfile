FROM node:18

WORKDIR /app

COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

WORKDIR /app/backend
RUN npm install
RUN npx prisma generate

COPY backend/ ./

EXPOSE 5000

CMD ["npx", "tsx", "src/server.ts"]