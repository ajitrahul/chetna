/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

/**
 * Usage:
 *   node scripts/supabase-copy-db.js <source-env-file> <target-env-file> [--mode=merge|replace] [--dry-run]
 *
 * Examples:
 *   node scripts/supabase-copy-db.js .env.prod .env.staging
 *   node scripts/supabase-copy-db.js .env.prod .env.staging --mode=replace
 *   node scripts/supabase-copy-db.js .env.prod .env.staging --dry-run
 *
 * Modes:
 *   merge   (default): insert rows that do not already exist (skip duplicates).
 *   replace: truncate target tables first, then copy all source rows.
 */

const args = process.argv.slice(2);
const sourceEnvPath = args[0];
const targetEnvPath = args[1];
const optionArgs = args.slice(2);

if (!sourceEnvPath || !targetEnvPath) {
  console.error('Usage: node scripts/supabase-copy-db.js <source-env-file> <target-env-file> [--mode=merge|replace] [--dry-run]');
  process.exit(1);
}

function parseOptions(rawOptions) {
  const options = {
    mode: 'merge',
    dryRun: false,
  };

  for (const rawOption of rawOptions) {
    if (rawOption === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (rawOption.startsWith('--mode=')) {
      const mode = rawOption.split('=')[1];
      if (mode !== 'merge' && mode !== 'replace') {
        console.error(`Invalid mode: ${mode}. Use --mode=merge or --mode=replace`);
        process.exit(1);
      }
      options.mode = mode;
      continue;
    }

    console.error(`Unknown option: ${rawOption}`);
    process.exit(1);
  }

  return options;
}

const options = parseOptions(optionArgs);
const sourceEnv = dotenv.config({ path: sourceEnvPath }).parsed;
const targetEnv = dotenv.config({ path: targetEnvPath }).parsed;

if (!sourceEnv || !targetEnv) {
  console.error('Failed to parse one or both environment files.');
  process.exit(1);
}

// For migrations and bulk inserts, use direct connections when available.
const SOURCE_URL = sourceEnv.DIRECT_URL || sourceEnv.DATABASE_URL;
const TARGET_URL = targetEnv.DIRECT_URL || targetEnv.DATABASE_URL;

if (!SOURCE_URL || !TARGET_URL) {
  console.error('Both environment files must contain DIRECT_URL or DATABASE_URL.');
  process.exit(1);
}

// Order matters for foreign key constraints.
const MIGRATION_ORDER = [
  'User', 'Account', 'Session', 'VerificationToken', 'UserProfileLimit',
  'Profile', 'Report', 'Question', 'CreditPack', 'CreditTransaction',
  'CreditRequest', 'JournalEntry', 'ExportRecord', 'PricingPlan',
  'ServiceCost', 'AnalyticsEvent', 'Newsletter', 'BlogPost', 'Topic', 'Post'
];

function modelKey(modelName) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function maskConnectionString(url) {
  return url.replace(/:[^:@]+@/, ':***@');
}

function quoteTableName(tableName) {
  return `"public"."${tableName.replace(/"/g, '""')}"`;
}

async function fetchExistingTables(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;

  return new Set(rows.map((row) => row.table_name));
}

async function countRows(prisma, modelName) {
  const key = modelKey(modelName);
  if (!prisma[key]) return 0;
  return prisma[key].count();
}

async function truncateTables(prisma, tableNames) {
  if (tableNames.length === 0) return;
  const sql = `TRUNCATE TABLE ${tableNames.map(quoteTableName).join(', ')} CASCADE;`;
  await prisma.$executeRawUnsafe(sql);
}

async function enableRls(prisma, tableNames) {
  for (const tableName of tableNames) {
    await prisma.$executeRawUnsafe(`ALTER TABLE ${quoteTableName(tableName)} ENABLE ROW LEVEL SECURITY;`);
    console.log(`  - RLS enabled on ${tableName}`);
  }
}

async function copyModelRows(source, target, modelName) {
  const key = modelKey(modelName);
  if (!source[key] || !target[key]) {
    return { sourceCount: 0, insertedCount: 0, skipped: true };
  }

  const rows = await source[key].findMany();
  if (rows.length === 0) {
    return { sourceCount: 0, insertedCount: 0, skipped: false };
  }

  if (options.dryRun) {
    return { sourceCount: rows.length, insertedCount: 0, skipped: false };
  }

  const result = await target[key].createMany({
    data: rows,
    skipDuplicates: true,
  });

  return { sourceCount: rows.length, insertedCount: result.count, skipped: false };
}

async function main() {
  console.log('\nSupabase Database Copy Tool');
  console.log(`Source Env: ${sourceEnvPath}`);
  console.log(`Target Env: ${targetEnvPath}`);
  console.log(`Mode: ${options.mode}`);
  console.log(`Dry Run: ${options.dryRun ? 'yes' : 'no'}`);
  console.log(`Source DB: ${maskConnectionString(SOURCE_URL)}`);
  console.log(`Target DB: ${maskConnectionString(TARGET_URL)}\n`);

  if (!options.dryRun) {
    console.log('Step 1/4: Pushing current Prisma schema to target...');
    try {
      execSync('npx prisma db push --skip-generate', {
        env: { ...process.env, DIRECT_URL: TARGET_URL, DATABASE_URL: TARGET_URL },
        stdio: 'inherit'
      });
      console.log('Schema push complete.\n');
    } catch (error) {
      console.error('Schema push failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Step 1/4: Dry run enabled. Skipping schema push.\n');
  }

  const source = new PrismaClient({ datasources: { db: { url: SOURCE_URL } } });
  const target = new PrismaClient({ datasources: { db: { url: TARGET_URL } } });

  try {
    await source.$connect();
    await target.$connect();

    console.log('Step 2/4: Checking table availability...');
    const [sourceTables, targetTables] = await Promise.all([
      fetchExistingTables(source),
      fetchExistingTables(target)
    ]);

    const missingInSource = MIGRATION_ORDER.filter((name) => !sourceTables.has(name));
    const missingInTarget = MIGRATION_ORDER.filter((name) => !targetTables.has(name));
    const migratableTables = MIGRATION_ORDER.filter((name) => sourceTables.has(name) && targetTables.has(name));

    if (missingInSource.length > 0) {
      console.log(`  - Missing in source (will skip): ${missingInSource.join(', ')}`);
    }
    if (missingInTarget.length > 0) {
      console.log(`  - Missing in target (will skip): ${missingInTarget.join(', ')}`);
    }
    console.log(`  - Migratable tables: ${migratableTables.length}/${MIGRATION_ORDER.length}\n`);

    console.log('Step 3/4: Inspecting target row counts...');
    let targetRowTotal = 0;
    for (const tableName of migratableTables) {
      const count = await countRows(target, tableName);
      targetRowTotal += count;
    }
    console.log(`  - Total rows currently in target (tracked tables): ${targetRowTotal}`);

    if (targetRowTotal > 0 && options.mode === 'merge') {
      console.log('  - Non-empty target detected. merge mode will only insert non-duplicate rows.');
      console.log('  - Existing rows are not updated or deleted in merge mode.');
    }

    if (targetRowTotal > 0 && options.mode === 'replace') {
      if (options.dryRun) {
        console.log('  - Dry run: replace mode would truncate target tables before copy.');
      } else {
        console.log('  - replace mode enabled: truncating target tables before copy...');
        await truncateTables(target, migratableTables);
        console.log('  - Target tables truncated.');
      }
    }
    console.log('');

    console.log('Step 4/4: Copying data...');
    let totalSourceRows = 0;
    let totalInsertedRows = 0;

    for (const modelName of migratableTables) {
      process.stdout.write(`  - ${modelName}: `);
      let sourceCount;
      let insertedCount;
      let skipped;

      try {
        ({ sourceCount, insertedCount, skipped } = await copyModelRows(source, target, modelName));
      } catch (error) {
        if (error && (error.code === 'P2021' || error.code === 'P2022')) {
          console.log('schema mismatch detected.');
          console.error(`    -> ${error.message}`);
          console.error('    -> Run `npx prisma db push` against BOTH source and target, then retry.');
          process.exitCode = 1;
          return;
        }

        throw error;
      }

      if (skipped) {
        console.log('skipped (model not available)');
        continue;
      }

      totalSourceRows += sourceCount;
      totalInsertedRows += insertedCount;

      if (sourceCount === 0) {
        console.log('empty source');
        continue;
      }

      if (options.dryRun) {
        console.log(`would copy ${sourceCount} row(s)`);
      } else {
        console.log(`inserted ${insertedCount}/${sourceCount} row(s)`);
      }
    }

    if (!options.dryRun) {
      console.log('\nApplying RLS enablement on target tables...');
      await enableRls(target, migratableTables);
    } else {
      console.log('\nDry run: skipping RLS enablement.');
    }

    console.log('\nCopy summary:');
    console.log(`  - Source rows scanned: ${totalSourceRows}`);
    console.log(`  - Rows inserted into target: ${totalInsertedRows}`);
    console.log(`  - Mode: ${options.mode}`);
    console.log(`  - Dry run: ${options.dryRun ? 'yes' : 'no'}`);
    console.log('\nDone.');
  } catch (error) {
    console.error('\nCopy process failed:', error);
    process.exitCode = 1;
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main();
