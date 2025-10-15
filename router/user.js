import express from 'express';
import { 
    getUserProfile,  
    getCompleteUserProfile,
    completeProfile, 
    deleteUserAccount ,
    completeCollageStudentProfile,
    completeSchoolStudentProfile,
    completeResearcherProfile,
    completeStartupProfile
} from '../controller/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', getUserProfile);

// Get complete user profile with all related data
router.get('/check/complete-profile', getCompleteUserProfile);

// Update user profile
router.put('/complete-profile', completeProfile);

// Complete profile (for first-time setup)
// router.post('/complete-profile', completeProfile); not user we user he profile comple

// Delete user account 
// router.delete('/account', deleteUserAccount); this route will be admin protected in future


router.post('/complete-profile/college-student', completeCollageStudentProfile);
router.post('/complete-profile/school-student', completeSchoolStudentProfile);
router.post('/complete-profile/researcher', completeResearcherProfile);
router.post('/complete-profile/startup', completeStartupProfile);

export default router;