import express from 'express';
import {
  createComplaint,
  deleteComplaint,
  getComplaintById,
  getComplaints,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaintById);
router.put('/:id/status', adminOnly, updateComplaintStatus);
router.delete('/:id', deleteComplaint);

export default router;
