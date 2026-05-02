/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

/**
 * Usage: node scripts/supabase-health-check.js <env-file>
 * Example: node scripts/supabase-health-check.js .env.prod
 */

const envPath = process.argv[2] || '.env';
const envConfig = dotenv.config({ path: envPath }).parsed || process.env;
const url = envConfig.DIRECT_URL || envConfig.DATABASE_URL;

if (!url) {
  console.error(`Could not find DIRECT_URL or DATABASE_URL in ${envPath}`);
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

const MODELS = [
  'User', 'Account', 'Session', 'VerificationToken', 'UserProfileLimit',
  'Profile', 'Report', 'Question', 'CreditPack', 'CreditTransaction', 'CreditRequest',
  'JournalEntry', 'ExportRecord', 'PricingPlan', 'ServiceCost',
  'AnalyticsEvent', 'Newsletter', 'BlogPost', 'Topic', 'Post'
];

function maskConnectionString(connectionString) {
  return connectionString.replace(/:[^:@]+@/, ':***@');
}

async function checkHealth() {
  console.log(`\nSupabase Health Check (${envPath})`);
  console.log(`Connecting to: ${maskConnectionString(url)}\n`);

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    console.log('Database is healthy and responsive.');
    console.log(`Latency: ${latencyMs}ms\n`);

    console.log('Table Row Counts:');
    for (const modelName of MODELS) {
      const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (!prisma[key]) continue;

      try {
        const count = await prisma[key].count();
        console.log(`  - ${modelName}: ${count}`);
      } catch {
        console.log(`  - ${modelName}: Error reading table`);
      }
    }

    console.log('');
  } catch (error) {
    console.error('Health check failed.');
    console.error(`Error details: ${error.message}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkHealth();
