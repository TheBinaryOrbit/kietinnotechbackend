import prisma from "../utils/prismaClient.js";

export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await prisma.requests.findMany({
            where: {
                requestedToId: userId,
                status: 'pending'
            },
            include: {
                team: {
                    include: {
                        leaderUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profileImage: true
                            }
                        },
                        category: true,
                        problemStatement: true
                    }
                },
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const respondToRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user.id;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be either "accept" or "reject"'
            });
        }

        // Find the request
        const request = await prisma.requests.findFirst({
            where: {
                id: parseInt(requestId),
                requestedToId: userId,
                status: 'pending'
            },
            include: {
                team: true
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or already processed'
            });
        }

        // Check if user is already in a team
        const userTeam = await prisma.team.findFirst({
            where: {
                OR: [
                    { leaderUserId: userId },
                    { member1Id: userId },
                    { member2Id: userId },
                    { member3Id: userId },
                    { member4Id: userId }
                ]
            }
        });

        if (userTeam && action === 'accept') {
            return res.status(400).json({
                success: false,
                message: 'You are already part of a team'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update request status
            const updatedRequest = await tx.requests.update({
                where: { id: parseInt(requestId) },
                data: { status: action === 'accept' ? 'accepted' : 'rejected' }
            });

            if (action === 'accept') {
                // Find available member slot in team
                const team = await tx.team.findUnique({
                    where: { id: request.teamId },
                    select: {
                        id: true,
                        member1Id: true,
                        member2Id: true,
                        member3Id: true,
                        member4Id: true,
                        teamSize: true
                    }
                });


                const userStartup = await tx.startup.findFirst({
                    where: {
                        userId: userId
                    }
                })

                if (!userStartup) {
                    // get the startup ID
                    const startupId = team.startupId;

                    console.log("Startup ID: ", startupId);

                    // create a replica of the startup and set the new user as the owner
                    const startupdata = await tx.startup.findUnique({
                        where: { userId: startupId },
                    });
                    

                    console.log("Startup Data: ", startupdata);

                    delete startupdata.id;
                    delete startupdata.userId;

                    console.log("Startup Data: ", startupdata);

                    // mapping the same data
                    await tx.startup.create({
                        data: {
                            ...startupdata,
                            userId: userId,
                        }
                    });
                }

                let updateData = {};
                if (!team.member1Id) {
                    updateData.member1Id = userId;
                } else if (!team.member2Id) {
                    updateData.member2Id = userId;
                } else if (!team.member3Id) {
                    updateData.member3Id = userId;
                } else if (!team.member4Id) {
                    updateData.member4Id = userId;
                } else {
                    throw new Error('Team is already full');
                }

                // Update team with new member
                const updatedTeam = await tx.team.update({
                    where: { id: request.teamId },
                    data: updateData
                });

                // Check if team is now complete (all slots filled up to teamSize)
                const filledSlots = [
                    updatedTeam.member1Id,
                    updatedTeam.member2Id,
                    updatedTeam.member3Id,
                    updatedTeam.member4Id
                ].filter(Boolean).length;

                if (filledSlots + 1 === updatedTeam.teamSize) { // +1 for leader
                    await tx.team.update({
                        where: { id: request.teamId },
                        data: { isCompleted: true }
                    });
                }




                // Reject all other pending requests for this user
                await tx.requests.updateMany({
                    where: {
                        requestedToId: userId,
                        status: 'pending',
                        id: { not: parseInt(requestId) }
                    },
                    data: { status: 'rejected' }
                });
            }

            return updatedRequest;
        });

        res.status(200).json({
            success: true,
            message: `Request ${action}ed successfully`,
            data: result
        });

    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

export const getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await prisma.requests.findMany({
            where: {
                requestedById: userId
            },
            include: {
                team: {
                    select: {
                        id: true,
                        teamName: true,
                        teamCode: true
                    }
                },
                requestedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const request = await prisma.requests.findFirst({
            where: {
                id: parseInt(requestId),
                requestedById: userId,
                status: 'pending'
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or cannot be cancelled'
            });
        }

        await prisma.requests.delete({
            where: { id: parseInt(requestId) }
        });

        // Update team request count
        await prisma.team.update({
            where: { id: request.teamId },
            data: { requestsCount: { decrement: 1 } }
        });

        res.status(200).json({
            success: true,
            message: 'Request cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};