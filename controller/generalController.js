import prisma from "../utils/prismaClient.js";

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                problemStatements: true
            }
        });

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getProblemStatements = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const problemStatements = await prisma.problemStatement.findMany({
            where: categoryId ? { categoryId: parseInt(categoryId) } : {},
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: problemStatements
        });

    } catch (error) {
        console.error('Error fetching problem statements:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query, participationCategory } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        // Find users not already in teams
        const usersInTeams = await prisma.team.findMany({
            select: {
                leaderUserId: true,
                member1Id: true,
                member2Id: true,
                member3Id: true,
                member4Id: true
            }
        });

        const userIdsInTeams = new Set();
        usersInTeams.forEach(team => {
            [team.leaderUserId, team.member1Id, team.member2Id, team.member3Id, team.member4Id]
                .filter(Boolean)
                .forEach(id => userIdsInTeams.add(id));
        });

        const whereClause = {
            AND: [
                {
                    OR: [
                        
                        { email: { contains: query, mode: 'insensitive' } },
                        { userId: { contains: query, mode: 'insensitive' } }
                    ]
                },
                { id: { not: currentUserId } },
                { id: { notIn: Array.from(userIdsInTeams) } }
            ]
        };

        if (participationCategory) {
            whereClause.AND.push({ participationCategory });
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                userId: true,
                // profileImage: true,
                participationCategory: true,
                isKietian: true
            },
            take: 20
        });

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};