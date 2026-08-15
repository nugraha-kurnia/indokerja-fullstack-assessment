import { Router } from 'express';
import { 
  applyJob, 
  getMyApplications, 
  getCompanyApplicants, 
  updateApplicationStatus 
} from '../controllers/application.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint Job Seeker
router.post('/apply', authenticate, authorizeRoles('JOB_SEEKER'), applyJob);
router.get('/my-applications', authenticate, authorizeRoles('JOB_SEEKER'), getMyApplications);

// Endpoint Perusahaan
router.get('/company/applicants', authenticate, authorizeRoles('COMPANY'), getCompanyApplicants);
router.put('/:id/status', authenticate, authorizeRoles('COMPANY'), updateApplicationStatus);

export default router;