import express from 'express';
import { 
    getCategories, 
    getProblemStatements, 
    searchUsers 
} from '../controller/generalController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/problem-statements/:categoryId', getProblemStatements);

// Protected routes
router.get('/search/users', authenticateToken, searchUsers);

export default router;