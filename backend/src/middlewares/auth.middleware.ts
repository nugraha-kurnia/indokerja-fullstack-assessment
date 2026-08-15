import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'JOB_SEEKER' | 'COMPANY';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'supersecretindokerjakey123';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: 'JOB_SEEKER' | 'COMPANY' };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses terlarang. Anda tidak memiliki izin untuk fitur ini.' });
    }
    next();
  };
};