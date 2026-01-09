
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const cost = await prisma.serviceCost.findUnique({
            where: { key: 'EXPAND_PROFILE_LIMIT' }
        });
        console.log('EXPAND_PROFILE_LIMIT:', cost);

        const allCosts = await prisma.serviceCost.findMany();
        console.log('All ServiceCosts:', allCosts);
    } catch (error) {
        console.error('Error fetching service cost:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
