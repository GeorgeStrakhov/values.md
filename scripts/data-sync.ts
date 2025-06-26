#!/usr/bin/env ts-node

/**
 * Data Synchronization Script
 * 
 * Ensures latest CSV data, database schema, and app code are in sync
 * Runs as part of CI/CD pipeline and can be triggered manually
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, count, sql } from 'drizzle-orm';
import { frameworks, motifs, dilemmas } from '../src/lib/schema';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface SyncResult {
  success: boolean;
  message: string;
  details?: any;
}

interface DataIntegrity {
  csvFiles: { [key: string]: number };
  databaseTables: { [key: string]: number };
  schemaVersion: string;
  lastSync: Date;
}

class DataSyncManager {
  private db: any;
  private striated_path = path.join(process.cwd(), 'striated');

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    const sql_client = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql_client);
  }

  /**
   * Main synchronization orchestrator
   */
  async syncAll(): Promise<SyncResult> {
    console.log('🔄 Starting data synchronization...');
    
    try {
      // 1. Validate CSV data integrity
      const csvValidation = await this.validateCsvFiles();
      if (!csvValidation.success) return csvValidation;

      // 2. Check database schema version
      const schemaCheck = await this.validateDatabaseSchema();
      if (!schemaCheck.success) return schemaCheck;

      // 3. Sync CSV data to database
      const dataSync = await this.syncCsvToDatabase();
      if (!dataSync.success) return dataSync;

      // 4. Validate data relationships
      const relationshipCheck = await this.validateDataRelationships();
      if (!relationshipCheck.success) return relationshipCheck;

      // 5. Update sync metadata
      await this.updateSyncMetadata();

      return {
        success: true,
        message: '✅ Data synchronization completed successfully',
        details: await this.getDataIntegrityReport()
      };

    } catch (error) {
      return {
        success: false,
        message: `❌ Synchronization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate CSV files exist and have expected structure
   */
  private async validateCsvFiles(): Promise<SyncResult> {
    const requiredFiles = ['frameworks.csv', 'motifs.csv', 'dilemmas.csv'];
    const missingFiles: string[] = [];
    const fileStats: { [key: string]: number } = {};

    for (const file of requiredFiles) {
      const filePath = path.join(this.striated_path, file);
      
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const records = parse(content, { columns: true, skip_empty_lines: true });
        fileStats[file] = records.length;
        
        // Validate required columns
        if (file === 'frameworks.csv' && records.length > 0) {
          const required = ['name', 'description', 'category'];
          const missing = required.filter(col => !(col in records[0]));
          if (missing.length > 0) {
            return {
              success: false,
              message: `❌ frameworks.csv missing columns: ${missing.join(', ')}`
            };
          }
        }

        if (file === 'motifs.csv' && records.length > 0) {
          const required = ['name', 'description', 'category', 'frameworks'];
          const missing = required.filter(col => !(col in records[0]));
          if (missing.length > 0) {
            return {
              success: false,
              message: `❌ motifs.csv missing columns: ${missing.join(', ')}`
            };
          }
        }

      } catch (error) {
        return {
          success: false,
          message: `❌ Error parsing ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    if (missingFiles.length > 0) {
      return {
        success: false,
        message: `❌ Missing CSV files: ${missingFiles.join(', ')}`
      };
    }

    console.log('✅ CSV files validated:', fileStats);
    return { success: true, message: 'CSV validation passed', details: fileStats };
  }

  /**
   * Check database schema is up to date
   */
  private async validateDatabaseSchema(): Promise<SyncResult> {
    try {
      // Check if required tables exist
      const tables = ['frameworks', 'motifs', 'dilemmas', 'userResponses'];
      
      for (const table of tables) {
        const result = await this.db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${table}
          );
        `);
        
        if (!result[0]?.exists) {
          return {
            success: false,
            message: `❌ Missing database table: ${table}. Run 'npm run db:migrate' first.`
          };
        }
      }

      console.log('✅ Database schema validated');
      return { success: true, message: 'Database schema validation passed' };

    } catch (error) {
      return {
        success: false,
        message: `❌ Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Sync CSV data to database with intelligent updates
   */
  private async syncCsvToDatabase(): Promise<SyncResult> {
    try {
      // Sync frameworks
      const frameworksPath = path.join(this.striated_path, 'frameworks.csv');
      const frameworksData = parse(fs.readFileSync(frameworksPath, 'utf-8'), { 
        columns: true, 
        skip_empty_lines: true 
      });

      let frameworksUpdated = 0;
      for (const row of frameworksData) {
        const existing = await this.db.select().from(frameworks).where(eq(frameworks.name, row.name));
        
        if (existing.length === 0) {
          await this.db.insert(frameworks).values({
            name: row.name,
            description: row.description,
            category: row.category,
            keyPrinciples: row.keyPrinciples?.split(';') || [],
            keywords: row.keywords?.split(',') || []
          });
          frameworksUpdated++;
        } else {
          // Update if content differs
          const current = existing[0];
          if (current.description !== row.description || current.category !== row.category) {
            await this.db.update(frameworks)
              .set({
                description: row.description,
                category: row.category,
                keyPrinciples: row.keyPrinciples?.split(';') || [],
                keywords: row.keywords?.split(',') || []
              })
              .where(eq(frameworks.name, row.name));
            frameworksUpdated++;
          }
        }
      }

      // Sync motifs (similar pattern)
      const motifsPath = path.join(this.striated_path, 'motifs.csv');
      const motifsData = parse(fs.readFileSync(motifsPath, 'utf-8'), { 
        columns: true, 
        skip_empty_lines: true 
      });

      let motifsUpdated = 0;
      for (const row of motifsData) {
        const existing = await this.db.select().from(motifs).where(eq(motifs.name, row.name));
        
        if (existing.length === 0) {
          await this.db.insert(motifs).values({
            name: row.name,
            description: row.description,
            category: row.category,
            frameworkConnections: row.frameworks?.split(',') || [],
            choiceIndicators: row.choiceIndicators?.split(';') || []
          });
          motifsUpdated++;
        }
      }

      console.log(`✅ Database sync: ${frameworksUpdated} frameworks, ${motifsUpdated} motifs updated`);
      return { 
        success: true, 
        message: 'Database sync completed',
        details: { frameworksUpdated, motifsUpdated }
      };

    } catch (error) {
      return {
        success: false,
        message: `❌ Database sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate data relationships and integrity
   */
  private async validateDataRelationships(): Promise<SyncResult> {
    try {
      // Check motif-framework relationships
      const motifsWithFrameworks = await this.db.select().from(motifs);
      const availableFrameworks = await this.db.select().from(frameworks);
      const frameworkNames = availableFrameworks.map(f => f.name);

      let invalidRelationships = 0;
      for (const motif of motifsWithFrameworks) {
        const connections = motif.frameworkConnections || [];
        for (const connection of connections) {
          if (!frameworkNames.includes(connection)) {
            console.warn(`⚠️ Motif "${motif.name}" references non-existent framework: ${connection}`);
            invalidRelationships++;
          }
        }
      }

      if (invalidRelationships > 0) {
        return {
          success: false,
          message: `❌ Found ${invalidRelationships} invalid framework references in motifs`
        };
      }

      console.log('✅ Data relationships validated');
      return { success: true, message: 'Data relationships validation passed' };

    } catch (error) {
      return {
        success: false,
        message: `❌ Relationship validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update sync metadata
   */
  private async updateSyncMetadata(): Promise<void> {
    const metadata = {
      lastSync: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      gitCommit: process.env.GITHUB_SHA || 'unknown'
    };

    // Store in database or file system
    fs.writeFileSync(
      path.join(process.cwd(), '.data-sync-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Generate data integrity report
   */
  private async getDataIntegrityReport(): Promise<DataIntegrity> {
    const csvFiles: { [key: string]: number } = {};
    const databaseTables: { [key: string]: number } = {};

    // Count CSV records
    const csvFileNames = ['frameworks.csv', 'motifs.csv', 'dilemmas.csv'];
    for (const file of csvFileNames) {
      const filePath = path.join(this.striated_path, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const records = parse(content, { columns: true, skip_empty_lines: true });
        csvFiles[file] = records.length;
      }
    }

    // Count database records
    const frameworkCount = await this.db.select({ count: count() }).from(frameworks);
    const motifCount = await this.db.select({ count: count() }).from(motifs);
    const dilemmaCount = await this.db.select({ count: count() }).from(dilemmas);

    databaseTables.frameworks = frameworkCount[0]?.count || 0;
    databaseTables.motifs = motifCount[0]?.count || 0;
    databaseTables.dilemmas = dilemmaCount[0]?.count || 0;

    return {
      csvFiles,
      databaseTables,
      schemaVersion: process.env.npm_package_version || '1.0.0',
      lastSync: new Date()
    };
  }
}

// CLI interface
async function main() {
  const syncManager = new DataSyncManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'validate':
      console.log('🔍 Validating data integrity...');
      const validation = await syncManager.validateCsvFiles();
      console.log(validation.message);
      process.exit(validation.success ? 0 : 1);
      
    case 'sync':
    default:
      const result = await syncManager.syncAll();
      console.log(result.message);
      if (result.details) {
        console.log('📊 Details:', JSON.stringify(result.details, null, 2));
      }
      process.exit(result.success ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DataSyncManager };