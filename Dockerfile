FROM node:22

WORKDIR /app

# Salin seluruh file
COPY . .

# Masuk ke folder backend
WORKDIR /app/backend

# Install dependensi & generate Prisma
RUN npm install
RUN npx prisma generate

EXPOSE 5000

# Jalankan server
CMD ["npx", "tsx", "src/server.ts"]