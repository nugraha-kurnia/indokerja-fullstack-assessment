import { Router } from 'express';
import { 
  createJob, 
  getAllJobs, 
  getJobById, 
  getCompanyJobs, 
  updateJob, 
  deleteJob 
} from '../controllers/job.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Route Publik
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Route Khusus Perusahaan (COMPANY)
router.post('/', authenticate, authorizeRoles('COMPANY'), createJob);
router.get('/company/my-jobs', authenticate, authorizeRoles('COMPANY'), getCompanyJobs);
router.put('/:id', authenticate, authorizeRoles('COMPANY'), updateJob);
router.delete('/:id', authenticate, authorizeRoles('COMPANY'), deleteJob);

export default router;