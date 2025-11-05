/**
 * Full MongoDB Database Backup Script
 * 
 * Backs up all collections to timestamped JSON files
 * Verifies data integrity and completeness
 * 
 * Run manually: pnpm exec tsx scripts/db/backup-mongodb.ts
 * Or via cron: 0 * * * * cd /path/to/repo && pnpm exec tsx scripts/db/backup-mongodb.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 24; // Keep last 24 hours of backups

interface CollectionStats {
  name: string;
  count: number;
  fileSize: number;
  backupPath: string;
}

interface BackupReport {
  timestamp: string;
  collections: CollectionStats[];
  totalCollections: number;
  totalDocuments: number;
  totalSize: number;
  verification: {
    allCollectionsBackedUp: boolean;
    allDataExists: boolean;
    missingCollections: string[];
    errors: string[];
  };
}

/**
 * Verify backup integrity
 */
function verifyBackup(report: BackupReport): boolean {
  const { verification } = report;
  
  let isValid = true;
  
  // Check all collections were backed up
  if (!verification.allCollectionsBackedUp) {
    console.error(`❌ Missing collections: ${verification.missingCollections.join(', ')}`);
    isValid = false;
  }
  
  // Check all data exists
  if (!verification.allDataExists) {
    console.error(`❌ Data verification failed`);
    isValid = false;
  }
  
  // Check for errors
  if (verification.errors.length > 0) {
    console.error(`❌ Errors during backup:`, verification.errors);
    isValid = false;
  }
  
  return isValid;
}

/**
 * Clean up old backups (keep only last MAX_BACKUPS hours)
 */
function cleanupOldBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time); // Newest first
    
    // Keep only the most recent MAX_BACKUPS
    const toDelete = files.slice(MAX_BACKUPS);
    
    if (toDelete.length > 0) {
      console.log(`🗑️  Cleaning up ${toDelete.length} old backups...`);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   Deleted: ${file.name}`);
      });
    }
  } catch (error) {
    console.error(`⚠️  Error cleaning up old backups:`, error);
  }
}

/**
 * Verify backup file exists and contains data
 */
function verifyBackupFile(backupPath: string, collectionName: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      return false;
    }
    
    const content = fs.readFileSync(backupPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Verify it's an array with data
    if (!Array.isArray(data)) {
      return false;
    }
    
    // Verify data integrity
    if (data.length === 0) {
      console.warn(`⚠️  Warning: ${collectionName} backup is empty`);
      return true; // Empty is valid, just warn
    }
    
    // Check first document has _id (MongoDB document)
    if (!data[0]._id && !data[0].id) {
      console.warn(`⚠️  Warning: ${collectionName} backup may be corrupted (no _id/id field)`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error verifying backup file ${backupPath}:`, error);
    return false;
  }
}

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
  const backupTimestamp = timestamp.split('T')[0] + '_' + timestamp.split('T')[1]; // YYYY-MM-DD_HH-MM-SS
  
  console.log(`\n🔄 Starting MongoDB backup at ${new Date().toISOString()}`);
  console.log(`📁 Backup directory: ${BACKUP_DIR}\n`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
  
  try {
    const db = await getMongoDb();
    console.log('✅ Connected to MongoDB');
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`📊 Found ${collectionNames.length} collections to backup\n`);
    
    const report: BackupReport = {
      timestamp: new Date().toISOString(),
      collections: [],
      totalCollections: collectionNames.length,
      totalDocuments: 0,
      totalSize: 0,
      verification: {
        allCollectionsBackedUp: true,
        allDataExists: true,
        missingCollections: [],
        errors: [],
      },
    };
    
    // Backup each collection
    for (const collectionName of collectionNames) {
      try {
        console.log(`📦 Backing up collection: ${collectionName}...`);
        
        const collection = db.collection(collectionName);
        
        // Get document count
        const count = await collection.countDocuments({});
        
        // Export all documents
        const documents = await collection.find({}).toArray();
        
        // Generate backup filename
        const filename = `${collectionName}_${backupTimestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, filename);
        
        // Write backup file
        fs.writeFileSync(
          backupPath,
          JSON.stringify(documents, null, 2),
          'utf-8'
        );
        
        // Get file size
        const stats = fs.statSync(backupPath);
        const fileSize = stats.size;
        
        // Verify backup
        const isValid = verifyBackupFile(backupPath, collectionName);
        
        if (!isValid) {
          report.verification.allDataExists = false;
          report.verification.errors.push(`Backup verification failed for ${collectionName}`);
        }
        
        report.collections.push({
          name: collectionName,
          count,
          fileSize,
          backupPath,
        });
        
        report.totalDocuments += count;
        report.totalSize += fileSize;
        
        const sizeMB = (fileSize / 1024 / 1024).toFixed(2);
        console.log(`   ✅ ${count} documents (${sizeMB} MB) → ${filename}`);
        
      } catch (error) {
        const errorMsg = `Failed to backup ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`   ❌ ${errorMsg}`);
        report.verification.errors.push(errorMsg);
        report.verification.allCollectionsBackedUp = false;
        report.verification.missingCollections.push(collectionName);
      }
    }
    
    // Save backup report
    const reportFilename = `backup-report_${backupTimestamp}.json`;
    const reportPath = path.join(BACKUP_DIR, reportFilename);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    // Verify overall backup
    const isValid = verifyBackup(report);
    
    console.log(`\n📊 Backup Summary:`);
    console.log(`   Collections: ${report.totalCollections}`);
    console.log(`   Documents: ${report.totalDocuments.toLocaleString()}`);
    console.log(`   Total Size: ${(report.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Status: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Report: ${reportFilename}\n`);
    
    // Clean up old backups
    cleanupOldBackups();
    
    if (!isValid) {
      console.error('❌ Backup verification failed! Please check the errors above.');
      process.exit(1);
    }
    
    console.log('✅ Backup complete and verified!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error during backup:', error);
    process.exit(1);
  }
}

backupDatabase();


