
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const plans = [
        {
            key: 'SINGLE_QUESTION',
            name: 'Single Clarity Question',
            description: 'One focused question at a time. Chart-aware, pattern-based guidance.',
            price: 14900, // ₹149.00
            credits: 1,
            currency: 'INR',
        },
        {
            key: 'CREDIT_PACK_5',
            name: '5 Question Credit Pack',
            description: 'Use at your own pace. Save ₹46 per question.',
            price: 69900, // ₹699.00
            credits: 5,
            currency: 'INR',
        },
        {
            key: 'CREDIT_PACK_10',
            name: '10 Question Credit Pack',
            description: 'Use at your own pace. Save ₹191 total.',
            price: 129900, // ₹1299.00
            credits: 10,
            currency: 'INR',
        },
    ];

    console.log('Seeding pricing plans...');

    for (const plan of plans) {
        const existing = await prisma.pricingPlan.findUnique({
            where: { key: plan.key },
        });

        if (!existing) {
            await prisma.pricingPlan.create({
                data: plan,
            });
            console.log(`Created plan: ${plan.key}`);
        } else {
            console.log(`Plan already exists: ${plan.key}`);
            // Optional: Update existing plan if needed
            // await prisma.pricingPlan.update({ where: { key: plan.key }, data: plan });
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
