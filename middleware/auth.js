import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                isKietian: true,
                participationCategory: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true,
                    isKietian: true,
                    participationCategory: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

// Middleware to check if user has completed profile
export const requireCompleteProfile = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Check if user has completed required profile fields
    if (!req.user.participationCategory) {
        return res.status(400).json({
            success: false,
            message: 'Please complete your profile to continue',
            redirect: '/complete-profile'
        });
    }

    next();
};