/**
 * Chetna DB Backup Script
 * ============================================================
 * Dumps all data from DATABASE_URL to a local JSON file.
 *
 * Usage:
 *   node scripts/backup-db.js
 *
 * Output: backups/backup-YYYY-MM-DD.json
 * ============================================================
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const MODELS = [
  'user', 'account', 'session', 'verificationToken', 'userProfileLimit',
  'profile', 'report', 'question', 'creditPack', 'creditTransaction',
  'journalEntry', 'exportRecord', 'pricingPlan', 'serviceCost',
  'analyticsEvent', 'newsletter', 'blogPost', 'topic', 'post',
];

async function main() {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, '..', 'backups');
  const outFile = path.join(backupDir, `backup-${timestamp}.json`);

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  console.log(`\n📦 Backing up database to: ${outFile}\n`);

  const backup = {};

  for (const model of MODELS) {
    if (!prisma[model]) { console.warn(`⚠️  Skipping: ${model}`); continue; }
    const rows = await prisma[model].findMany();
    backup[model] = rows;
    console.log(`  ✅ ${model}: ${rows.length} rows`);
  }

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2));
  console.log(`\n🎉 Backup saved: ${outFile}`);
  console.log(`   Size: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`);
}

main()
  .catch(e => { console.error('💥 Backup failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
