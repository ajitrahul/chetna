/**
 * Chetna DB Restore Script
 * ============================================================
 * Restores data from a JSON backup file into DATABASE_URL.
 *
 * Usage:
 *   node scripts/restore-db.js backups/backup-2026-03-20.json
 *
 * ⚠️  WARNING: This inserts data on top of existing records (skipDuplicates).
 *              To do a clean restore, manually clear the DB first.
 * ============================================================
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const RESTORE_ORDER = [
  'user', 'account', 'session', 'verificationToken', 'userProfileLimit',
  'profile', 'report', 'question', 'creditPack', 'creditTransaction',
  'journalEntry', 'exportRecord', 'pricingPlan', 'serviceCost',
  'analyticsEvent', 'newsletter', 'blogPost', 'topic', 'post',
];

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error('❌ Usage: node scripts/restore-db.js <backup-file.json>');
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`\n♻️  Restoring from: ${file}\n`);

  for (const model of RESTORE_ORDER) {
    const rows = backup[model];
    if (!rows || rows.length === 0) {
      console.log(`  ⏩ ${model}: empty, skipped`);
      continue;
    }

    if (!prisma[model]) { console.warn(`  ⚠️  Unknown model: ${model}`); continue; }

    const result = await prisma[model].createMany({ data: rows, skipDuplicates: true });
    console.log(`  ✅ ${model}: ${result.count}/${rows.length} rows restored`);
  }

  console.log('\n🎉 Restore complete!');
}

main()
  .catch(e => { console.error('💥 Restore failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
