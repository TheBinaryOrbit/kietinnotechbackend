
import prisma from "./prismaClient.js";

export default getProject = (participationCategory , userId) => {
    if (participationCategory === 'school') {
        const projectData = prisma.schoolStudent.findUnique({
            where: { userId: userId }
        })

        return projectData
    }

    if (participationCategory === 'researcher') {
        const projectData = prisma.researcher.findUnique({
            where: { userId: userId }
        })
        return  projectData
    }

    if (participationCategory === 'startup') {
        const projectData = prisma.startup.findUnique({
            where: { userId: userId }
        })
        return  projectData
    }
    return null;
}
