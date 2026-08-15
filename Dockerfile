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
CMD ["sh", "-c", "npx prisma db push && npm run dev"]