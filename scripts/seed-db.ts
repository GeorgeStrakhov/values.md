import 'dotenv/config';
import { db } from '../src/lib/db';
import { frameworks, motifs, dilemmas } from '../src/lib/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim()) // Skip empty lines
    .map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
}

async function seedFrameworks() {
  console.log('Seeding frameworks...');
  const csvPath = join(process.cwd(), 'striated/frameworks.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const frameworkData = parseCSV(csvContent);
  
  for (const row of frameworkData) {
    await db.insert(frameworks).values({
      frameworkId: row.framework_id,
      name: row.name,
      tradition: row.tradition,
      keyPrinciple: row.key_principle,
      decisionMethod: row.decision_method,
      lexicalIndicators: row.lexical_indicators,
      computationalSignature: row.computational_signature,
      historicalFigure: row.historical_figure,
      modernApplication: row.modern_application,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${frameworkData.length} frameworks`);
}

async function seedMotifs() {
  console.log('Seeding motifs...');
  const csvPath = join(process.cwd(), 'striated/motifs.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const motifData = parseCSV(csvContent);
  
  for (const row of motifData) {
    await db.insert(motifs).values({
      motifId: row.motif_id,
      name: row.name,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      lexicalIndicators: row.lexical_indicators,
      behavioralIndicators: row.behavioral_indicators,
      logicalPatterns: row.logical_patterns,
      conflictsWith: row.conflicts_with,
      synergiesWith: row.synergies_with,
      weight: row.weight || null,
      culturalVariance: row.cultural_variance,
      cognitiveLoad: row.cognitive_load,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${motifData.length} motifs`);
}

async function seedDilemmas() {
  console.log('Seeding dilemmas...');
  const csvPath = join(process.cwd(), 'striated/dilemmas.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const dilemmaData = parseCSV(csvContent);
  
  for (const row of dilemmaData) {
    if (!row.dilemma_id) continue; // Skip empty rows
    
    await db.insert(dilemmas).values({
      dilemmaId: randomUUID(), // Generate new UUID instead of using CSV ID
      domain: row.domain,
      generatorType: row.generator_type,
      difficulty: row.difficulty ? parseInt(row.difficulty) : null,
      title: row.title,
      scenario: row.scenario,
      choiceA: row.choice_a,
      choiceAMotif: row.choice_a_motif,
      choiceB: row.choice_b,
      choiceBMotif: row.choice_b_motif,
      choiceC: row.choice_c,
      choiceCMotif: row.choice_c_motif,
      choiceD: row.choice_d,
      choiceDMotif: row.choice_d_motif,
      targetMotifs: row.target_motifs,
      stakeholders: row.stakeholders,
      culturalContext: row.cultural_context,
      validationScore: row.validation_score || null,
      realismScore: row.realism_score || null,
      tensionStrength: row.tension_strength || null,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${dilemmaData.filter(d => d.dilemma_id).length} dilemmas`);
}

async function main() {
  try {
    await seedFrameworks();
    await seedMotifs();
    await seedDilemmas();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}