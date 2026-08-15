# 🇮🇩 IndoKerja.id - Job Application Management System

[![Frontend](https://img.shields.io/badge/Frontend-React.js%20%2B%20TypeScript%20%2B%20Vite-blue)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express.js%20%2B%20TypeScript-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma%20ORM-indigo)](https://www.prisma.io/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-cyan)](https://tailwindcss.com/)

Aplikasi platform rekrutmen kerja *full-stack* yang memfasilitasi interaksi antara **Job Seeker** (Pencari Kerja) dan **Company** (Perusahaan / Corporate Recruiter) secara *real-time*. Dibangun untuk memenuhi kualifikasi **Full Stack Developer Assessment - IndoKerja.id**.

---

## 🌟 Fitur Utama (Features)

### 👤 1. Job Seeker Portal
- **Autentikasi & Otorisasi:** Registrasi dan Login berbasis JWT Token.
- **Job Board & Discovery:** Menampilkan seluruh lowongan kerja lengkap dengan filter *search* kata kunci dan tipe pekerjaan (*Full-time, Part-time, Contract, Internship, Remote*).
- **Job Detail & Company Map:** Menampilkan rincian tanggung jawab lowongan, gaji, profil perusahaan, dan integrasi peta lokasi (Google Maps).
- **One-Click Apply & Anti-Duplicate Validation:** Melamar pekerjaan dengan validasi sistem agar tidak dapat melamar lowongan yang sama lebih dari satu kali.
- **My Applications & Timeline Tracker:** Melacak status lamaran secara terperinci dengan riwayat perubahan status (*application history*).
- **Profile & Resume Management:** Mengelola identitas, nomor kontak, ringkasan profesional, persentase kelengkapan profil *real-time*, unggah foto profil (Avatar), dan unggah berkas CV (PDF).

### 🏢 2. Company / Recruiter Portal
- **Recruitment Dashboard:** Ringkasan metrik statistik lowongan aktif dan total kandidat pelamar.
- **Job Post Management (CRUD):** Membuat lowongan baru, mengubah data lowongan (*Edit*), menyaring status (*Active, Drafts, Closed*), dan menghapus lowongan (*Cascade Delete*).
- **Applicant Management & Action Center:** Meninjau seluruh berkas kandidat pelamar yang masuk pada lowongan milik perusahaan.
- **Status Pipeline Progression:** Memperbarui status seleksi kandidat (*Applied, Reviewing, Shortlisted, Accepted, Rejected*).
- **CV Viewer:** Akses langsung untuk membuka dan mengunduh berkas Curriculum Vitae (PDF) pelamar.
- **Company Settings:** Pengaturan nama entitas bisnis, industri, dan URL situs resmi perusahaan.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Frontend** | React.js 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication** | JSON Web Token (JWT), Bcrypt Password Hashing |
| **HTTP Client** | Axios / Fetch API |

---

## 🗄️ Skema Database (Prisma Models)

Sistem menggunakan database relasional PostgreSQL dengan struktur 4 model utama:
- **`User`:** Menyimpan data pengguna, *role* (`JOB_SEEKER` / `COMPANY`), informasi profil, foto profil, dan berkas CV.
- **`Job`:** Menyimpan data lowongan pekerjaan yang berelasi dengan entitas `User` (Company).
- **`Application`:** Menyimpan berkas lamaran yang menghubungkan `User` (Job Seeker) dan `Job` dengan *unique compound key* `@@unique([jobId, userId])` untuk mencegah duplikasi lamaran.
- **`ApplicationHistory`:** Menyimpan jejak rekam log perubahan status lamaran beserta stempel waktu (*timestamp*).

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal (Local Setup)

### Prasyarat:
- Node.js (v18 ke atas)
- PostgreSQL Database yang sedang berjalan secara lokal atau menggunakan Cloud Database (Supabase / Neon / Railway).

---

### 1. Setup Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend



1.Pasang semua dependensi:

Bash
npm install

2. Buat file .env di dalam folder backend/ dan sesuaikan nilainya:

PORT=5000
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/indokerja_db?schema=public"
JWT_SECRET="indokerja_super_secret_jwt_key_2026"

3.Jalankan sinkronisasi database dan generate Prisma client:

npx prisma db push
npx prisma generate

4.Jalankan server backend dalam mode pengembangan:

npm run dev

2. Setup Frontend

1.Buka terminal baru, masuk ke direktori frontend:

Bash
cd frontend

2.Pasang dependensi frontend:

Bash
npm install

3.Jalankan server Vite:

Bash
npm run dev

4.Buka peramban (browser) di tautan: http://localhost:5173.

📖 Dokumentasi REST API Sederhana
Semua endpoint yang memerlukan token otentikasi harus menyertakan header:

Authorization: Bearer <JWT_TOKEN>

Method,Endpoint,Access,Deskripsi
POST,/api/auth/register,Public,Mendaftarkan akun baru (JOB_SEEKER atau COMPANY)
POST,/api/auth/login,Public,Autentikasi user dan mengembalikan token JWT
GET,/api/auth/profile,Protected,Mengambil rincian data akun yang sedang login
PUT,/api/auth/profile,Protected,"Memperbarui profil, no. telepon, headline, avatar, & CV"

💼 Jobs Managemen

Method,Endpoint,Access,Deskripsi
GET,/api/jobs,Public,Mengambil seluruh daftar lowongan pekerjaan aktif
GET,/api/jobs/:id,Public,Mengambil detail spesifik satu lowongan
POST,/api/jobs,Company,Menerbitkan lowongan pekerjaan baru
GET,/api/jobs/company/my-jobs,Company,Mengambil daftar lowongan milik perusahaan login
PUT,/api/jobs/:id,Company,Mengubah data lowongan pekerjaan
DELETE,/api/jobs/:id,Company,Menghapus lowongan pekerjaan beserta relasinya

📄 Applications Management

Method,Endpoint,Access,Deskripsi
POST,/api/applications/apply,Job Seeker,Mengirimkan lamaran kerja pada lowongan tertentu
GET,/api/applications/my-applications,Job Seeker,Mengambil daftar riwayat lamaran beserta status timeline
GET,/api/applications/company/applicants,Company,Mengambil daftar seluruh kandidat pelamar
PUT,/api/applications/:id/status,Company,Mengubah status lamaran kandidat seleksi

🧪 Kredensial Akun untuk Pengujian (Testing Credentials)Untuk mempermudah proses evaluasi aplikasi:  Akun Job Seeker:Email: nugrahadaring@gmail.comRole: JOB_SEEKERAkun Company / Recruiter:Email: qiscom@gmail.com (atau email perusahaan yang kamu gunakan)Role: COMPANY👨‍💻 DeveloperNama: Muhammad Nugraha KurniaPosisi: Full Stack Developer CandidatePlatform: IndoKerja.id Assessment