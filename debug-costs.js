import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const costs = await prisma.serviceCost.findMany();
    console.log('Service Costs in DB:', JSON.stringify(costs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
