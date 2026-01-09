
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';

async function main() {
    const args = process.argv.slice(2);
    const fromEnv = args.find(a => a.startsWith('--from='))?.split('=')[1] || '.env.local';
    const toEnv = args.find(a => a.startsWith('--to='))?.split('=')[1] || '.env.prod';
    const execute = args.includes('--execute');

    console.log(`\n--- DATABASE DATA COPY: ${fromEnv} -> ${toEnv} ---`);
    
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

    const fromPrisma = new PrismaClient({
        datasources: { db: { url: fromConfig.DATABASE_URL } }
    });

    const toPrisma = new PrismaClient({
        datasources: { db: { url: toConfig.DATABASE_URL } }
    });

    try {
        console.log(`📡 Fetching tools from source (${fromEnv})...`);
        const sourceTools = await fromPrisma.tool.findMany();
        console.log(`📊 Found ${sourceTools.length} tools in source.`);

        if (!execute) {
            console.log(`\n⚠️  DRY RUN: Run with --execute to perform the actual copy.`);
            console.log(`Plan: Upsert ${sourceTools.length} tools into ${toEnv}.`);
            return;
        }

        console.log(`⏳ Copying ${sourceTools.length} tools to target (${toEnv})...`);
        
        const BATCH_SIZE = 100;
        for (let i = 0; i < sourceTools.length; i += BATCH_SIZE) {
            const batch = sourceTools.slice(i, i + BATCH_SIZE);
            
            const ops = batch.map(tool => {
                // Remove unwanted fields or handle specific logic if needed
                // For now, we do a full upsert based on slug
                const { createdAt, updatedAt, ...toolData } = tool;
                return toPrisma.tool.upsert({
                    where: { slug: tool.slug },
                    update: toolData,
                    create: toolData
                });
            });

            await toPrisma.$transaction(ops);
            process.stdout.write('.');
        }

        console.log(`\n✅ Successfully copied/updated ${sourceTools.length} tools in ${toEnv}.`);

    } catch (err: any) {
        console.error(`\n❌ Error during copy:`, err.message);
    } finally {
        await fromPrisma.$disconnect();
        await toPrisma.$disconnect();
    }
}

main().catch(console.error);
