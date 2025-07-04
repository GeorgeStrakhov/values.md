import { db } from '../src/lib/db';
import { dilemmas, motifs, frameworks } from '../src/lib/schema';
import fs from 'fs';
import path from 'path';

// Simple CSV parser
function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

async function importSampleDilemmas() {
  try {
    console.log('📚 Importing sample dilemmas...');
    
    // Read and parse CSV
    const csvPath = path.join(process.cwd(), 'striated', 'dilemmas.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const dilemmaData = parseCSV(csvContent);
    
    console.log(`Found ${dilemmaData.length} dilemmas in CSV`);
    
    // Import first 10 dilemmas to start
    const sampleDilemmas = dilemmaData.slice(0, 10).map(row => ({
      dilemmaId: row.dilemma_id,
      domain: row.domain,
      generatorType: row.generator_type,
      difficulty: parseInt(row.difficulty) || 5,
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
      validationScore: parseFloat(row.validation_score) || null,
      realismScore: parseFloat(row.realism_score) || null,
      tensionStrength: parseFloat(row.tension_strength) || null,
    }));
    
    // Clear existing dilemmas first
    await db.delete(dilemmas);
    
    // Insert new dilemmas
    await db.insert(dilemmas).values(sampleDilemmas);
    
    console.log(`✅ Successfully imported ${sampleDilemmas.length} dilemmas`);
    
    // Also import sample motifs
    console.log('📚 Importing sample motifs...');
    const motifsPath = path.join(process.cwd(), 'striated', 'motifs.csv');
    const motifsContent = fs.readFileSync(motifsPath, 'utf-8');
    const motifData = parseCSV(motifsContent);
    
    const sampleMotifs = motifData.slice(0, 15).map(row => ({
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
      weight: parseFloat(row.weight) || null,
      culturalVariance: row.cultural_variance,
      cognitiveLoad: row.cognitive_load,
    }));
    
    await db.delete(motifs);
    await db.insert(motifs).values(sampleMotifs);
    
    console.log(`✅ Successfully imported ${sampleMotifs.length} motifs`);
    
    // Sample frameworks
    console.log('📚 Importing sample frameworks...');
    const frameworksPath = path.join(process.cwd(), 'striated', 'frameworks.csv');
    const frameworksContent = fs.readFileSync(frameworksPath, 'utf-8');
    const frameworkData = parseCSV(frameworksContent);
    
    const sampleFrameworks = frameworkData.slice(0, 10).map(row => ({
      frameworkId: row.framework_id,
      name: row.name,
      tradition: row.tradition,
      keyPrinciple: row.key_principle,
      decisionMethod: row.decision_method,
      lexicalIndicators: row.lexical_indicators,
      computationalSignature: row.computational_signature,
      historicalFigure: row.historical_figure,
      modernApplication: row.modern_application,
    }));
    
    await db.delete(frameworks);
    await db.insert(frameworks).values(sampleFrameworks);
    
    console.log(`✅ Successfully imported ${sampleFrameworks.length} frameworks`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importSampleDilemmas();