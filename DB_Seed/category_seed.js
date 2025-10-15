import prisma from "../utils/prismaClient.js";


const categories = [
    { name: 'Smart Solutions, Smarter Society' , description: 'This category includes the E-projects' },
    { name: 'AI solutions for automation' , description: 'This category includes the AI based projects' },
    { name: 'Automation and Robotics' , description: 'This category includes the IOT and embedded system projects' },
    { name: 'From Concept to Reality' , description: 'This category includes the Drone, EV, medical devices, Green energy based projects' },
    { name: 'Start Small, Scale Big, Sustain Always' , description: 'This category includes Start-up ideas and Business solutions' },
    { name: 'Gen Z to Budding Engineers' , description: 'This category includes prototypes and solutions from First year students only' },
    { name: 'Creative Visions for a Sustainable Future' , description: 'This category includes Posters and Models' },
];

const seedCategories = async () => {
    try {
        await prisma.category.deleteMany({});
        await prisma.category.createMany({ data: categories });
        console.log('Categories seeded successfully');
    } catch (error) {
        console.error('Error seeding categories:', error);
    }
};

seedCategories();