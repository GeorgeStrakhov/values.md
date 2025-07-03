const fs = require('fs');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { pgTable, varchar, text, integer, decimal, timestamp, uuid } = require('drizzle-orm/pg-core');
require('dotenv').config({ path: '.env.local' });

// Define dilemmas table schema directly
const dilemmas = pgTable('dilemmas', {
  dilemmaId: uuid('dilemma_id').defaultRandom().primaryKey(),
  domain: varchar('domain'),
  generatorType: varchar('generator_type'),
  difficulty: integer('difficulty'),
  title: varchar('title').notNull(),
  scenario: text('scenario').notNull(),
  choiceA: text('choice_a').notNull(),
  choiceAMotif: varchar('choice_a_motif'),
  choiceB: text('choice_b').notNull(),
  choiceBMotif: varchar('choice_b_motif'),
  choiceC: text('choice_c').notNull(),
  choiceCMotif: varchar('choice_c_motif'),
  choiceD: text('choice_d').notNull(),
  choiceDMotif: varchar('choice_d_motif'),
  targetMotifs: text('target_motifs'),
  stakeholders: text('stakeholders'),
  culturalContext: varchar('cultural_context'),
  validationScore: decimal('validation_score'),
  realismScore: decimal('realism_score'),
  tensionStrength: decimal('tension_strength'),
  createdAt: timestamp('created_at').defaultNow(),
});

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function importDilemmas() {
  try {
    console.log('🔄 Reading CSV file...');
    const csvContent = fs.readFileSync('new-dilemmas.csv', 'utf8');
    const lines = csvContent.split('\n').slice(1).filter(line => line.trim());
    
    console.log(`📊 Found ${lines.length} dilemmas to import`);
    
    const dilemmasToInsert = [];
    
    for (const line of lines) {
      // Parse CSV line with proper handling of quoted fields
      const fields = [];
      let current = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
          i++;
          continue;
        } else {
          current += char;
        }
        i++;
      }
      fields.push(current.trim());
      
      if (fields.length >= 15) {
        const dilemma = {
          title: fields[0].replace(/^"|"$/g, ''),
          scenario: fields[1].replace(/^"|"$/g, ''),
          choiceA: fields[2].replace(/^"|"$/g, ''),
          choiceAMotif: fields[3].replace(/^"|"$/g, ''),
          choiceB: fields[4].replace(/^"|"$/g, ''),
          choiceBMotif: fields[5].replace(/^"|"$/g, ''),
          choiceC: fields[6].replace(/^"|"$/g, ''),
          choiceCMotif: fields[7].replace(/^"|"$/g, ''),
          choiceD: fields[8].replace(/^"|"$/g, ''),
          choiceDMotif: fields[9].replace(/^"|"$/g, ''),
          domain: fields[10].replace(/^"|"$/g, ''),
          difficulty: parseInt(fields[11].replace(/^"|"$/g, '')) || 5,
          stakeholders: fields[12].replace(/^"|"$/g, ''),
          culturalContext: fields[13].replace(/^"|"$/g, ''),
          targetMotifs: fields[14].replace(/^"|"$/g, ''),
          generatorType: 'manual',
          validationScore: 0.95,
          realismScore: 0.90,
          tensionStrength: 0.85
        };
        
        dilemmasToInsert.push(dilemma);
      }
    }
    
    console.log(`✅ Parsed ${dilemmasToInsert.length} dilemmas`);
    console.log('📝 Sample dilemma:', dilemmasToInsert[0].title);
    
    // Insert into database
    console.log('💾 Inserting dilemmas into database...');
    const result = await db.insert(dilemmas).values(dilemmasToInsert);
    
    console.log(`🎉 Successfully imported ${dilemmasToInsert.length} dilemmas!`);
    
    // Verify count
    const count = await db.select().from(dilemmas);
    console.log(`📊 Total dilemmas in database: ${count.length}`);
    
  } catch (error) {
    console.error('❌ Error importing dilemmas:', error);
    process.exit(1);
  }
}

importDilemmas();