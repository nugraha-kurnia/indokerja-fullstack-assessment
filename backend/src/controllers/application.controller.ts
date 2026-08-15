import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. Fungsi Melamar Pekerjaan (Job Seeker)
export const applyJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    const userId = req.user?.id;

    if (!jobId || !userId) {
      return res.status(400).json({ message: 'Job ID dan User ID tidak valid.' });
    }

    // Cek apakah sudah pernah melamar di lowongan ini
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: { jobId, userId },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Anda sudah melamar lowongan ini sebelumnya.' });
    }

    // Buat data lamaran baru beserta riwayat status awalnya
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        status: 'APPLIED',
        history: {
          create: { status: 'APPLIED' },
        },
      },
    });

    console.log(`[SUKSES MELAMAR] User: ${userId} -> Job: ${jobId}`);
    return res.status(201).json({ message: 'Lamaran berhasil dikirim!', application });
  } catch (error: any) {
    console.error('Error Apply Job:', error);
    return res.status(500).json({ message: error.message || 'Gagal mengirim lamaran.' });
  }
};

// 2. Fungsi Mengambil Riwayat Lamaran Saya (Job Seeker)
export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, email: true } },
          },
        },
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(applications);
  } catch (error: any) {
    console.error('Error Get My Applications:', error);
    return res.status(500).json({ message: 'Gagal mengambil data lamaran.', error: error.message });
  }
};

// 3. Fungsi Mengambil Semua Pelamar untuk Perusahaan (Company)
export const getCompanyApplicants = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak valid.' });
    }

    // Cari semua ID lowongan milik perusahaan yang sedang login
    const myJobs = await prisma.job.findMany({
      where: { companyId },
      select: { id: true },
    });
    const jobIds = myJobs.map((j) => j.id);

    // Ambil data seluruh pelamar yang melamar ke lowongan-lowongan tersebut
    const applicants = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
      },
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
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
          },
        },
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(applicants);
  } catch (error: any) {
    console.error('Error Get Company Applicants:', error);
    return res.status(500).json({ message: 'Gagal mengambil data pelamar.', error: error.message });
  }
};

// 4. Fungsi Update Status Lamaran (Diterima, Interview, Ditolak, dll)
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status terbaru wajib dikirim.' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        history: {
          create: { status },
        },
      },
    });

    return res.status(200).json({ message: 'Status berhasil diperbarui', application });
  } catch (error: any) {
    console.error('Error Update Application Status:', error);
    return res.status(500).json({ message: 'Gagal memperbarui status.', error: error.message });
  }
};