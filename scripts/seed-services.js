
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const services = [
        {
            key: 'ASK_QUESTION',
            description: 'Cost for asking a single clarity question to the AI.',
            credits: 1
        },
        { key: 'CHART_D2', description: 'Unlock Hora (Wealth) Chart', credits: 5 },
        { key: 'CHART_D3', description: 'Unlock Drekkana (Siblings) Chart', credits: 5 },
        { key: 'CHART_D4', description: 'Unlock Chaturthamsha (Property) Chart', credits: 5 },
        { key: 'CHART_D5', description: 'Unlock Panchamsha (Fame) Chart', credits: 5 },
        { key: 'CHART_D6', description: 'Unlock Shashthamsa (Health) Chart', credits: 5 },
        { key: 'CHART_D7', description: 'Unlock Saptamsha (Children) Chart', credits: 5 },
        { key: 'CHART_D8', description: 'Unlock Ashtamsha (Longevity) Chart', credits: 5 },
        { key: 'CHART_D10', description: 'Unlock Dashamsha (Career) Chart', credits: 5 },
        { key: 'CHART_D12', description: 'Unlock Dwadashamsha (Parents) Chart', credits: 5 },
        { key: 'CHART_D16', description: 'Unlock Shodashamsha (Happiness) Chart', credits: 5 },
        { key: 'CHART_D20', description: 'Unlock Vimshamsha (Spirituality) Chart', credits: 5 },
        { key: 'CHART_D24', description: 'Unlock Chaturvimshamsha (Learning) Chart', credits: 5 },
        { key: 'CHART_D27', description: 'Unlock Saptavimshamsha (Strengths) Chart', credits: 5 },
        { key: 'CHART_D30', description: 'Unlock Trimshamsha (Misfortune) Chart', credits: 5 },
    ];

    console.log('Seeding service costs...');

    for (const service of services) {
        const existing = await prisma.serviceCost.findUnique({
            where: { key: service.key },
        });

        if (!existing) {
            await prisma.serviceCost.create({
                data: service,
            });
            console.log(`Created service cost: ${service.key} = ${service.credits} credits`);
        } else {
            console.log(`Service cost already exists: ${service.key}`);
        }
    }

    console.log('Service cost seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
