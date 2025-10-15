import prisma from "../utils/prismaClient.js";
import { getTeamCode } from "../utils/getcode.js";

export const createTeam = async (req, res) => {
    try {
        const { 
            teamName, 
            memberUserIds, 
            department, 
            categoryId, 
            problemStatementId,
            startupId,
            schoolStudentId,
            inovationIdeaName,
            inovationIdeaDesc
        } = req.body;
        
        const { id : leaderUserId, participationCategory, isKietian } = req.user;

        // Basic validation
        if (!teamName || !department || !memberUserIds || !Array.isArray(memberUserIds)) {
            return res.status(400).json({
                success: false,
                message: 'Team name, department, and member user IDs array are required'
            });
        }

        // Validate team size (min 2, max 5 including leader)
        if (memberUserIds.length < 1 || memberUserIds.length > 4) {
            return res.status(400).json({
                success: false,
                message: 'Team must have 2-5 members including leader (provide 1-4 member IDs)'
            });
        }

        // Check if leader is already in a team
        const existingTeam = await prisma.team.findFirst({
            where: {
                OR: [
                    { leaderUserId },
                    { member1Id: leaderUserId },
                    { member2Id: leaderUserId },
                    { member3Id: leaderUserId },
                    { member4Id: leaderUserId }
                ]
            }
        });

        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: 'You are already in a team'
            });
        }

        // Validate members exist and are not already in teams
        const members = await prisma.user.findMany({
            where: {
                id: { in: memberUserIds }
            }
        });

        if (members.length !== memberUserIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more member IDs are invalid'
            });
        }

        // Check if any members are already in teams
        const membersInTeams = await prisma.team.findMany({
            where: {
                OR: [
                    { leaderUserId: { in: memberUserIds } },
                    { member1Id: { in: memberUserIds } },
                    { member2Id: { in: memberUserIds } },
                    { member3Id: { in: memberUserIds } },
                    { member4Id: { in: memberUserIds } }
                ]
            }
        });

        if (membersInTeams.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'One or more members are already in a team'
            });
        }

        // Generate team code based on participation category
        const teamCode = getTeamCode(participationCategory);

        // Prepare team data
        let teamData = {
            teamName,
            teamCode,
            leaderUserId,
            participationCategory,
            isKeitian: isKietian,
            department,
            teamSize: memberUserIds.length + 1, // +1 for leader
            isCompleted: false
        };

        // Category-specific validations and data
        if (participationCategory === "college") {
            if (!categoryId || !problemStatementId || !inovationIdeaDesc || !inovationIdeaName) {
                return res.status(400).json({
                    success: false,
                    message: 'Category and Problem Statement are required for college students'
                });
            }
            teamData.categoryId = categoryId;
            teamData.problemStatementId = problemStatementId;
            teamData.inovationIdeaName = inovationIdeaName;
            teamData.inovationIdeaDesc = inovationIdeaDesc;
        }

        if (participationCategory === "startup") {
            if (!startupId) {
                return res.status(400).json({
                    success: false,
                    message: 'Startup ID is required for startup category'
                });
            }
            teamData.startupId = startupId;
        }

        if (participationCategory === "school") {
            if (!schoolStudentId) {
                return res.status(400).json({
                    success: false,
                    message: 'School student ID is required for school students'
                });
            }
            teamData.schoolStudentId = schoolStudentId;
            teamData.inovationIdeaName = inovationIdeaName;
            teamData.inovationIdeaDesc = inovationIdeaDesc;
        }

        if (participationCategory === "researcher") {
            // Add researcher specific logic if needed
            teamData.inovationIdeaName = inovationIdeaName;
            teamData.inovationIdeaDesc = inovationIdeaDesc;
        }

        // Create team and requests in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the team
            const newTeam = await tx.team.create({
                data: teamData,
                include: {
                    leaderUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    category: true,
                    problemStatement: true
                }
            });

            // Create requests for all members
            const requests = await Promise.all(
                memberUserIds.map(async (memberId) => {
                    return tx.requests.create({
                        data: {
                            teamId: newTeam.id,
                            requestedById: leaderUserId,
                            requestedToId: memberId,
                            status: 'pending'
                        }
                    });
                })
            );

            // Update team's request count
            await tx.team.update({
                where: { id: newTeam.id },
                data: { requestsCount: requests.length }
            });

            return { team: newTeam, requests };
        });

        res.status(201).json({
            success: true,
            message: 'Team created successfully and requests sent to members',
            data: {
                team: result.team,
                requestsSent: result.requests.length
            }
        });

    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTeamDetails = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;

        const team = await prisma.team.findFirst({
            where: {
                AND: [
                    { id: parseInt(teamId) },
                    {
                        OR: [
                            { leaderUserId: userId },
                            { member1Id: userId },
                            { member2Id: userId },
                            { member3Id: userId },
                            { member4Id: userId }
                        ]
                    }
                ]
            },
            include: {
                leaderUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member1: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member2: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member3: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member4: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                category: true,
                problemStatement: true,
                requests: {
                    include: {
                        requestedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or you are not a member'
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });

    } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getUserTeam = async (req, res) => {
    try {
        const userId = req.user.id;

        const team = await prisma.team.findFirst({
            where: {
                OR: [
                    { leaderUserId: userId },
                    { member1Id: userId },
                    { member2Id: userId },
                    { member3Id: userId },
                    { member4Id: userId }
                ]
            },
            include: {
                requests: {
                    select :{
                        id: true,
                        status: true,
                        requestedTo: {
                            select: {
                                id: true,
                                name: true,
                                profileImage : true,
                            }
                        }
                    },
                },
                leaderUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member1: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member2: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member3: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                },
                member4: {
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
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'You are not part of any team'
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });

    } catch (error) {
        console.error('Error fetching user team:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



