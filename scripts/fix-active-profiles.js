// Script to ensure only one active profile per user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMultipleActiveProfiles() {
    try {
        // Get all users
        const users = await prisma.user.findMany({
            include: {
                profiles: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        console.log(`Found ${users.length} users`);

        for (const user of users) {
            const activeProfiles = user.profiles;
            console.log(`User ${user.email} has ${activeProfiles.length} active profiles`);

            if (activeProfiles.length > 1) {
                // Keep the most recent profile active, disable the rest
                const [mostRecent, ...oldProfiles] = activeProfiles;

                console.log(`  Keeping profile: ${mostRecent.name} (${mostRecent.id})`);

                for (const oldProfile of oldProfiles) {
                    console.log(`  Disabling profile: ${oldProfile.name} (${oldProfile.id})`);
                    await prisma.profile.update({
                        where: { id: oldProfile.id },
                        data: {
                            isActive: false,
                            disabledAt: new Date(),
                            disabledReason: 'Replaced by newer active profile'
                        }
                    });
                }

                console.log(`  Fixed user ${user.email}`);
            } else if (activeProfiles.length === 0) {
                // If no active profiles, make the most recent one active
                const allProfiles = await prisma.profile.findMany({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                });

                if (allProfiles.length > 0) {
                    console.log(`  Activating most recent profile for ${user.email}`);
                    await prisma.profile.update({
                        where: { id: allProfiles[0].id },
                        data: { isActive: true }
                    });
                }
            } else {
                console.log(`  User ${user.email} is OK (1 active profile)`);
            }
        }

        console.log('\n✅ Fix completed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixMultipleActiveProfiles();
