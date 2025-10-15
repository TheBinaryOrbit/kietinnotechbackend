import jwt from 'jsonwebtoken';

export const googleCallback = async (req, res) => {
    try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
            {
                userId: req.user.id,
                email: req.user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("Generated JWT Token:", token);

        // Set token as httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to frontend success page
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/register?token=${token}`);
    } catch (error) {
        console.error('Error in OAuth callback:', error);
        res.redirect('/login/failed');
    }
}


export const onSuccess = (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                profileImage: req.user.profileImage,
                isKietian: req.user.isKietian,
                participationCategory: req.user.participationCategory
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
}


export const onFailed = (req, res) => {
    res.status(401).json({
        success: false,
        message: "Authentication failed"
    });
}

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error logging out"
            });
        }

        // Clear the token cookie
        res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    });
}

export const getInfo = async (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                profileImage: req.user.profileImage,
                isKietian: req.user.isKietian,
                participationCategory: req.user.participationCategory
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }
}

