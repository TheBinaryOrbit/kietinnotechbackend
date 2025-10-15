import express from 'express';
import { 
    createTeam, 
    getTeamDetails, 
    getUserTeam 
} from '../controller/team.controller.js';
import { 
    getPendingRequests, 
    respondToRequest, 
    getSentRequests,
    cancelRequest
} from '../controller/requestsController.js';
import { authenticateToken, requireCompleteProfile } from '../middleware/auth.js';

const router = express.Router();

// All team routes require authentication and complete profile
router.use(authenticateToken);
router.use(requireCompleteProfile);

// Team management routes
router.post('/create', createTeam);
router.get('/my-team', getUserTeam);
router.get('/:teamId', getTeamDetails);

// Request management routes
router.get('/requests/pending', getPendingRequests);
router.get('/requests/sent', getSentRequests);
router.post('/requests/:requestId/respond', respondToRequest);
router.delete('/requests/:requestId/cancel', cancelRequest);

export default router;