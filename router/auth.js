import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { googleCallback, logout, onFailed, onSuccess , getInfo } from '../controller/auth.controller.js';

const  router = express.Router();

// Route to start Google OAuth process
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login/failed' }), googleCallback);

// Success route
router.get('/success', onSuccess);

// Failed login route
router.get('/failed', onFailed);

// Logout route
router.post('/logout', logout);

// Route to get current user info
router.get('/me', getInfo);

export default router;