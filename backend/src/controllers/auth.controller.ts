import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware'; // Import disatukan di atas

// 1. Fungsi Registrasi
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
    }

    if (!['JOB_SEEKER', 'COMPANY'].includes(role)) {
      return res.status(400).json({ message: 'Role harus JOB_SEEKER atau COMPANY.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      message: 'Registrasi berhasil.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Register Error:', error);
    return res.status(500).json({
      message: error.message || 'Terjadi kesalahan pada server.',
      error,
    });
  }
};

// 2. Fungsi Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, dan tipe akun wajib diisi.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Validasi ketat: Cegah Job Seeker masuk ke Company (dan sebaliknya)
    if (user.role !== role) {
      const roleName = user.role === 'JOB_SEEKER' ? 'Job Seeker' : 'Perusahaan';
      return res.status(401).json({ 
        message: `Akses ditolak! Email ini terdaftar sebagai akun ${roleName}. Silakan login di tab yang sesuai.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const secret = process.env.JWT_SECRET || 'supersecretindokerjakey123';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// 3. Fungsi Ambil Data Profil
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Gagal memuat profil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, newPassword, headline, phone, cvUrl, avatarUrl } = req.body;

    let updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (headline !== undefined) updateData.headline = headline;
    if (phone !== undefined) updateData.phone = phone;
    if (cvUrl !== undefined) updateData.cvUrl = cvUrl;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return res.status(200).json({ message: 'Profil berhasil diperbarui.', updatedUser });
  } catch (error: any) {
    console.error('Update Profile DB Error:', error);
    return res.status(500).json({ message: error.message || 'Gagal update profil ke database.' });
  }
};