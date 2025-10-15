import prisma from "./prismaClient.js"

export const createTeamWithData = (data) => {
    try {
        const team = prisma.team.create({
            data: data
        })
        return team
    } catch (error) {
        console.error('Error creating team:', error)
        throw new Error('Internal server error')
    }
}