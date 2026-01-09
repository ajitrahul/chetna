
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';

async function main() {
    const args = process.argv.slice(2);
    const fromEnv = args.find(a => a.startsWith('--from='))?.split('=')[1] || '.env.local';
    const toEnv = args.find(a => a.startsWith('--to='))?.split('=')[1] || '.env.prod';
    const execute = args.includes('--execute');

    console.log(`\n--- DATABASE SYNC (Full Schema): ${fromEnv} -> ${toEnv} ---`);

    if (!fs.existsSync(fromEnv) || !fs.existsSync(toEnv)) {
        console.log(`❌ Missing environment files: ${!fs.existsSync(fromEnv) ? fromEnv : ''} ${!fs.existsSync(toEnv) ? toEnv : ''}`);
        return;
    }

    const fromConfig = dotenv.parse(fs.readFileSync(fromEnv));
    const toConfig = dotenv.parse(fs.readFileSync(toEnv));

    if (!fromConfig.DATABASE_URL || !toConfig.DATABASE_URL) {
        console.log('❌ Missing DATABASE_URL in one or both env files.');
        return;
    }

    const fromPrisma = new PrismaClient({ datasources: { db: { url: fromConfig.DATABASE_URL } } });
    const toPrisma = new PrismaClient({ datasources: { db: { url: toConfig.DATABASE_URL } } });

    // Models to copy in dependency order
    // Models to copy in dependency order (Parents first, Children last)
    const models = [
        'verificationToken',
        'pricingPlan',
        'serviceCost',
        'analyticsEvent',
        'newsletter',
        'blogPost',
        'user',              // Parent to many
        'account',           // Depends on User
        'session',           // Depends on User
        'profile',           // Depends on User
        'report',            // Depends on Profile
        'question',          // Depends on User
        'creditPack',        // Depends on User
        'journalEntry',      // Depends on User
        'exportRecord',      // Depends on User
        'creditTransaction', // Depends on User
        'topic',             // Depends on User
        'post',              // Depends on Topic and User
        'userProfileLimit'   // Depends on User
    ];

    try {
        if (execute) {
            console.log(`\n🧹 Truncating destination tables in reverse order...`);
            // To avoid foreign key issues, we delete in reverse order of the models list
            const reverseModels = [...models].reverse();
            for (const model of reverseModels) {
                try {
                    await (toPrisma as any)[model].deleteMany({});
                    process.stdout.write('.');
                } catch (e: any) {
                    console.log(`\n⚠️ Warning: could not truncate ${model}: ${e.message}`);
                }
            }
            console.log(`\n✅ Truncation complete.`);
        }

        for (const model of models) {
            console.log(`\n📦 Processing model: ${model}...`);
            const sourceData = await (fromPrisma as any)[model].findMany();
            console.log(`   - Found ${sourceData.length} records in source.`);

            if (sourceData.length === 0) continue;

            if (!execute) {
                console.log(`   - [DRY RUN] Would copy ${sourceData.length} records into ${toEnv}.`);
                continue;
            }

            console.log(`   - Copying ${sourceData.length} records...`);
            const BATCH_SIZE = 1000;
            for (let i = 0; i < sourceData.length; i += BATCH_SIZE) {
                const batch = sourceData.slice(i, i + BATCH_SIZE);

                const dataToInsert = batch.map((item: any) => {
                    const data = { ...item };
                    delete data.createdAt;
                    delete data.updatedAt;
                    return data;
                });

                await (toPrisma as any)[model].createMany({
                    data: dataToInsert,
                    skipDuplicates: true // Safeguard
                });

                process.stdout.write('.');
            }
            console.log(`\n   - Done.`);
        }

        console.log(`\n✅ Successfully copied/updated all metadata tables in ${toEnv}.`);

    } catch (err: any) {
        console.error(`\n❌ Error during metadata copy:`, err.message);
        console.error(err);
    } finally {
        await fromPrisma.$disconnect();
        await toPrisma.$disconnect();
    }
}

main().catch(console.error);
