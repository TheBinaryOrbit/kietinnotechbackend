import prisma from "../utils/prismaClient.js";

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                userId : true,
                email: true,
                phonenumber: true,
                profileImage: true,
                isKietian: true,
                participationCategory: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if(user.phonenumber !== null && user.participationCategory !== null){
            user.isProfileComplete = {
                basicProfile: true
            }
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get complete user profile with all related data
export const getCompleteUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                collegeStudent: true,
                startup: true,
                schoolStudent: true,
                researcher: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Map all data into a single JSON response
        const completeProfile = {
            // Basic user information
            id: user.id,
            name: user.name,
            userId: user.userId,
            email: user.email,
            phonenumber: user.phonenumber,
            googleId: user.googleId,
            profileImage: user.profileImage,
            participationCategory: user.participationCategory,
            isKietian: user.isKietian,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            // Category-specific profile data
            profileDetails: null
        };

        // Map category-specific data based on participation category
        switch (user.participationCategory) {
            case 'college':
                completeProfile.profileDetails = user.collegeStudent ? {
                    type: 'collegeStudent',
                    id: user.collegeStudent.id,
                    college: user.collegeStudent.college,
                    course: user.collegeStudent.course,
                    year: user.collegeStudent.year,
                    branch: user.collegeStudent.branch
                } : null;
                break;

            case 'startup':
                completeProfile.profileDetails = user.startup ? {
                    type: 'startup',
                    id : user.startup.id,
                    startupName: user.startup.startupName,
                    website: user.startup.website,
                    startupSector: user.startup.startupSector,
                    stage: user.startup.stage,
                    city: user.startup.city,
                    teamSize: user.startup.teamSize,
                    founderName: user.startup.founderName,
                    founderEmail: user.startup.founderEmail,
                    founderUid: user.startup.founderUid,
                    founderPhonenumber: user.startup.founderPhonenumber,
                    description: user.startup.description,
                    problemSolving: user.startup.problemSolving,
                    uvp: user.startup.uvp,
                    pitchDeckLink: user.startup.pitchDeckLink,
                    isFunded: user.startup.isFunded,
                    fundedBy: user.startup.fundedBy,
                    eventExpections: user.startup.eventExpections,
                    additionalInfo: user.startup.additionalInfo
                } : null;
                break;

            case 'school':
                completeProfile.profileDetails = user.schoolStudent ? {
                    type: 'schoolStudent',
                    id: user.schoolStudent.id,
                    school: user.schoolStudent.school,
                    standard: user.schoolStudent.standard,
                    board: user.schoolStudent.board,
                    uid: user.schoolStudent.uid
                } : null;
                break;

            case 'researcher':
                completeProfile.profileDetails = user.researcher ? {
                    type: 'researcher',
                    id: user.researcher.id,
                    uid: user.researcher.uid,
                    universityName: user.researcher.universityName,
                    pursuingDegree: user.researcher.pursuingDegree
                } : null;
                break;

            default:
                completeProfile.profileDetails = null;
        }

        // Add completion status
        completeProfile.isProfileComplete = {
            basicProfile: !!(user.participationCategory && user.phonenumber),
            categoryProfile: !!completeProfile.profileDetails
        };

        res.status(200).json({
            success: true,
            user: completeProfile
        });

    } catch (error) {
        console.error('Error fetching complete user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user profile
export const completeProfile = async (req, res) => {
    try {
        const { name, phonenumber, participationCategory, isKietian } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (participationCategory && !['school', 'college', 'researcher', 'startup'].includes(participationCategory)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid participation category'
            });
        }

        // Check if phone number is already taken by another user
        if (phonenumber) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    AND: [
                        { phonenumber },
                        { id: { not: userId } }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number is already registered'
                });
            }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phonenumber && { phonenumber }),
                ...(participationCategory && { participationCategory }),
                ...(typeof isKietian === 'boolean' && { isKietian })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phonenumber: true,
                profileImage: true,
                isKietian: true,
                participationCategory: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is a team leader
        const teamsAsLeader = await prisma.team.findMany({
            where: { leaderUserId: userId }
        });

        if (teamsAsLeader.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete account while being a team leader. Please transfer leadership or delete teams first.'
            });
        }

        // Delete user account
        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export const completeCollageStudentProfile = async (req, res) => {
    try {
        const { college, course, year , branch , uid } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!college || !course || !year || !branch || !uid) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check year must be number and between 1 to 4
        if (isNaN(year) || year < 1 || year > 4) {
            return res.status(400).json({
                success: false,
                message: 'Year must be a number between 1 and 4'
            });
        }

        const collegeStudentProfile = await prisma.collegeStudent.create({
            data: {
                userId,
                college,
                course,
                year,
                branch,
                uid
            }
        });

        res.status(200).json({
            success: true,
            message: 'College student profile completed successfully',
            collegeStudentProfile
        });

    } catch (error) {

        console.error('Error completing college student profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export const completeSchoolStudentProfile = async (req, res) => {
    try {
        const { school, standard, board, uid } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!school || !standard || !board || !uid) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (uid.length !== 12) {
            return res.status(400).json({
                success: false,
                message: 'UID/Aadhar must be 12 characters long'
            });
        }

        const schoolStudentProfile = await prisma.schoolStudent.create({
            data: {
                userId,
                school,
                standard,
                board,
                uid
            }
        });

        res.status(200).json({
            success: true,
            message: 'School student profile completed successfully',
            schoolStudentProfile
        });

    } catch (error) {
        console.error('Error completing school student profile:', error);

        if (error.code === 'P2002' && error.meta && error.meta.target.includes('uid')) {
            return res.status(400).json({
                success: false,
                message: 'UID/Aadhar must be unique. This UID/Aadhar is already registered.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export const completeResearcherProfile = async (req, res) => {
    try {
        const { pursuingDegree, universityName, uid } = req.body;
        const userId = req.user.id;


        // Validate required fields
        if (!pursuingDegree || !universityName || !uid) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (uid.length !== 12) {
            return res.status(400).json({
                success: false,
                message: 'UID/Aadhar must be 12 characters long'
            });
        }

        const researcherProfile = await prisma.researcher.create({
            data: {
                userId,
                pursuingDegree,
                universityName,
                uid
            }
        });

        res.status(200).json({
            success: true,
            message: 'Researcher profile completed successfully',
            researcherProfile
        });

    } catch (error) {
        console.error('Error completing researcher profile:', error);

        if (error.code === 'P2002' && error.meta && error.meta.target.includes('uid')) {
            return res.status(400).json({
                success: false,
                message: 'UID/Aadhar must be unique. This UID/Aadhar is already registered.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const completeStartupProfile = async (req, res) => {
    try {
        const { startupName, website, startupSector, stage, city, teamSize, founderName, founderEmail, founderPhonenumber, description, problemSolving, uvp, pitchDeckLink, isFunded, fundedBy, eventExpections, additionalInfo, founderUid } = req.body;
        const userId = req.user.id;



        if (!startupName || !website || !startupSector || !stage || !city || !founderName || !founderEmail || !founderPhonenumber || !description || !problemSolving || !uvp || !pitchDeckLink || !eventExpections || !founderUid) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        
        if (founderUid.trim().length !== 12) {
            return res.status(400).json({
                success: false,
                message: 'Founder UID/Aadhar must be 12 characters long'
            });
        }

        const startupProfile = await prisma.startup.create({
            data: {
                userId,
                startupName,
                website,
                startupSector,
                stage,
                city,
                teamSize,
                founderName,
                founderEmail,
                founderPhonenumber,
                description,
                problemSolving,
                uvp,
                pitchDeckLink,
                isFunded,
                fundedBy,
                eventExpections,
                additionalInfo,
                founderUid
            }
        });

        res.status(200).json({
            success: true,
            message: 'Startup profile completed successfully',
            startupProfile
        });

    } catch (error) {
        console.error('Error completing startup profile:', error);

        if( error.code === 'P2002' && error.meta && error.meta.target.includes('founderUid')) {
            return res.status(400).json({
                success: false,
                message: 'Founder UID/Aadhar must be unique. This UID/Aadhar is already registered.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}