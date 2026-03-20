/**
 * Chetna DB Migration Script
 * ============================================================
 * Copies all data from SOURCE_DATABASE_URL to TARGET_DATABASE_URL.
 *
 * Usage:
 *   node scripts/migrate-db.js
 *
 * Environment Variables:
 *   SOURCE_DATABASE_URL  - Connection string of the SOURCE database
 *   TARGET_DATABASE_URL  - Connection string of the TARGET database
 *
 * Example (copy from production to a new Supabase/Neon instance):
 *   SOURCE_DATABASE_URL=postgresql://user:pass@old-host/db \
 *   TARGET_DATABASE_URL=postgresql://user:pass@new-host/db \
 *   node scripts/migrate-db.js
 *
 * ⚠️  WARNING: This will OVERWRITE all data in TARGET_DATABASE_URL.
 * ============================================================
 */

const { PrismaClient } = require('@prisma/client');

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.TARGET_DATABASE_URL;

if (!SOURCE_URL || !TARGET_URL) {
  console.error('❌ Please set both SOURCE_DATABASE_URL and TARGET_DATABASE_URL env variables.');
  process.exit(1);
}

const source = new PrismaClient({ datasources: { db: { url: SOURCE_URL } } });
const target = new PrismaClient({ datasources: { db: { url: TARGET_URL } } });

// ORDER MATTERS! Tables with FK dependencies must come after parents.
const MIGRATION_ORDER = [
  'User',
  'Account',
  'Session',
  'VerificationToken',
  'UserProfileLimit',
  'Profile',
  'Report',
  'Question',
  'CreditPack',
  'CreditTransaction',
  'JournalEntry',
  'ExportRecord',
  'PricingPlan',
  'ServiceCost',
  'AnalyticsEvent',
  'Newsletter',
  'BlogPost',
  'Topic',
  'Post',
];

async function migrateTable(modelName) {
  // Prisma model names are PascalCase; client methods are camelCase
  const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  
  if (!source[key] || !target[key]) {
    console.warn(`⚠️  Skipping unknown model: ${modelName}`);
    return;
  }

  console.log(`📦 Migrating ${modelName}...`);
  const rows = await source[key].findMany();
  
  if (rows.length === 0) {
    console.log(`   └─ (empty, skipped)`);
    return;
  }

  // Use createMany with skipDuplicates for safety
  const result = await target[key].createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`   └─ ✅ ${result.count}/${rows.length} rows migrated`);
}

async function main() {
  console.log('\n🚀 Chetna DB Migration Starting...');
  console.log('Source:', SOURCE_URL.replace(/:[^:@]+@/, ':***@'));
  console.log('Target:', TARGET_URL.replace(/:[^:@]+@/, ':***@'));
  console.log('');

  try {
    await source.$connect();
    await target.$connect();
    console.log('✅ Both databases connected\n');

    for (const model of MIGRATION_ORDER) {
      await migrateTable(model);
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    console.error('\n💥 Migration failed:', err.message);
    process.exit(1);
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main();
