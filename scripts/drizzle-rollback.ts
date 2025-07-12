import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function rollbackToMigration0004() {
  console.log('Starting rollback to migration 0004_public_magik.sql...\n');
  
  // Step 1: Backup current migration journal
  const journalPath = join(__dirname, '..', 'drizzle', 'meta', '_journal.json');
  const journalBackupPath = join(__dirname, '..', 'drizzle', 'meta', '_journal.backup.json');
  
  try {
    const journalContent = readFileSync(journalPath, 'utf-8');
    writeFileSync(journalBackupPath, journalContent);
    console.log('✓ Backed up migration journal to _journal.backup.json');
  } catch (error) {
    console.error('Failed to backup journal:', error);
    process.exit(1);
  }

  // Step 2: Run the SQL rollback script
  const sql = neon(DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    console.log('Executing rollback SQL...');
    const rollbackSQL = readFileSync(join(__dirname, 'rollback-to-0004.sql'), 'utf-8');
    
    // Execute the rollback SQL
    await sql(rollbackSQL);
    console.log('✓ Rollback SQL executed successfully');
  } catch (error) {
    console.error('Failed to execute rollback SQL:', error);
    console.log('\nTo restore journal backup: cp drizzle/meta/_journal.backup.json drizzle/meta/_journal.json');
    process.exit(1);
  }

  // Step 3: Update Drizzle journal to remove migrations after 0004
  try {
    const journal = JSON.parse(readFileSync(journalPath, 'utf-8'));
    
    // Keep only migrations up to and including 0004
    const targetIndex = journal.entries.findIndex((entry: any) => 
      entry.tag === '0004_public_magik'
    );
    
    if (targetIndex === -1) {
      throw new Error('Could not find migration 0004_public_magik in journal');
    }
    
    // Remove all entries after 0004
    journal.entries = journal.entries.slice(0, targetIndex + 1);
    
    // Write updated journal
    writeFileSync(journalPath, JSON.stringify(journal, null, 2));
    console.log('✓ Updated migration journal');
    
    // Show removed migrations
    const removedCount = journal.entries.length - (targetIndex + 1);
    console.log(`✓ Removed ${removedCount} migrations from journal`);
  } catch (error) {
    console.error('Failed to update journal:', error);
    console.log('\nTo restore journal backup: cp drizzle/meta/_journal.backup.json drizzle/meta/_journal.json');
    process.exit(1);
  }

  console.log('\n✅ Rollback completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run db:push" to sync the schema');
  console.log('2. Verify your application works correctly');
  console.log('3. If needed, restore journal: cp drizzle/meta/_journal.backup.json drizzle/meta/_journal.json');
}

// Run the rollback
rollbackToMigration0004().catch(console.error);