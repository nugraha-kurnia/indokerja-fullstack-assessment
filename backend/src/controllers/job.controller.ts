import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. Buat Lowongan Baru (Terkait langsung ke ID Perusahaan)
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, salary, jobType } = req.body;
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Tidak diizinkan, token perusahaan tidak valid.' });
    }

    if (!title || !description || !location || !salary || !jobType) {
      return res.status(400).json({ message: 'Semua kolom lowongan wajib diisi.' });
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary,
        jobType,
        companyId,
      },
    });

    return res.status(201).json(newJob);
  } catch (error: any) {
    console.error('Error Create Job:', error);
    return res.status(500).json({ message: 'Gagal membuat lowongan.', error: error.message });
  }
};

// 2. Ambil Semua Lowongan (Untuk Job Board Publik / Job Seeker)
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error('Error Get All Jobs:', error);
    return res.status(500).json({ message: 'Gagal mengambil data lowongan.', error: error.message });
  }
};

// 3. Ambil Detail 1 Lowongan Berdasarkan ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Lowongan tidak ditemukan.' });
    }

    return res.status(200).json(job);
  } catch (error: any) {
    console.error('Error Get Job By ID:', error);
    return res.status(500).json({ message: 'Gagal mengambil detail lowongan.', error: error.message });
  }
};

// 4. Ambil Semua Lowongan Milik Perusahaan Tertentu (Lengkap dengan Pelamar & Hitungan)
export const getCompanyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak valid.' });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { applications: true }, // Menghitung total pelamar otomatis
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                headline: true,
                phone: true,
                avatarUrl: true,
                cvUrl: true,
              },
            },
            history: {
              orderBy: { changedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error('Error Get Company Jobs:', error);
    return res.status(500).json({ message: 'Gagal mengambil lowongan perusahaan.', error: error.message });
  }
};

// Alias fungsi agar kompatibel jika route memanggil getMyCompanyJobs
export const getMyCompanyJobs = getCompanyJobs;

// 5. Update / Edit Lowongan
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const companyId = req.user?.id;
    const { title, description, location, salary, jobType } = req.body;

    if (!companyId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const updatedJob = await prisma.job.updateMany({
      where: { id, companyId },
      data: { title, description, location, salary, jobType },
    });

    if (updatedJob.count === 0) {
      return res.status(403).json({ message: 'Lowongan tidak ditemukan atau bukan milik Anda.' });
    }

    return res.status(200).json({ message: 'Lowongan berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Error Update Job:', error);
    return res.status(500).json({ message: 'Gagal mengupdate lowongan.', error: error.message });
  }
};

// 6. Hapus Lowongan (Cascade Delete: Hapus riwayat & lamaran terlebih dahulu)
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    // Validasi kepemilikan lowongan
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.companyId !== companyId) {
      return res.status(403).json({ message: 'Lowongan tidak ditemukan atau bukan milik Anda.' });
    }

    // Tahap 1: Hapus riwayat status lamaran pada lowongan ini
    await prisma.applicationHistory.deleteMany({
      where: {
        application: { jobId: id },
      },
    });

    // Tahap 2: Hapus data lamaran yang masuk pada lowongan ini
    await prisma.application.deleteMany({
      where: { jobId: id },
    });

    // Tahap 3: Hapus data lowongannya
    await prisma.job.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Lowongan berhasil dihapus permanen.' });
  } catch (error: any) {
    console.error('Error Delete Job:', error);
    return res.status(500).json({ message: 'Gagal menghapus lowongan.', error: error.message });
  }
};