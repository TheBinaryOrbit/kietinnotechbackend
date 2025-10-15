import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../utils/prismaClient.js';


// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists in our database
        let existingUser = await prisma.user.findUnique({
            where: { googleId: profile.id }
        });

        if (existingUser) {
            // User exists, return the user
            return done(null, existingUser);
        }

        // Check if a user with this email already exists
        let userWithEmail = await prisma.user.findUnique({
            where: { email: profile.emails[0].value }
        });

        if (userWithEmail) {
            // Update existing user with Google ID
            const updatedUser = await prisma.user.update({
                where: { email: profile.emails[0].value },
                data: {
                    googleId: profile.id,
                    profileImage: profile.photos[0]?.value
                }
            });
            return done(null, updatedUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                profileImage: profile.photos[0]?.value,
                // Set default values for required fields
                isKietian: false
            }
        });

        return done(null, newUser);
    } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;