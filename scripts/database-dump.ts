import { db } from '@/lib/db';
import { 
  dilemmas, 
  userResponses, 
  userDemographics, 
  llmResponses,
  frameworks,
  motifs
} from '@/lib/schema';
import fs from 'fs';

async function createDatabaseDump() {
  console.log('💾 Creating database dump...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpDir = `./database-dumps/${timestamp}`;
  
  // Create dump directory
  if (!fs.existsSync('./database-dumps')) {
    fs.mkdirSync('./database-dumps');
  }
  fs.mkdirSync(dumpDir);

  try {
    // Dump dilemmas
    console.log('📝 Dumping dilemmas...');
    const dilemmasData = await db.select().from(dilemmas);
    fs.writeFileSync(`${dumpDir}/dilemmas.json`, JSON.stringify(dilemmasData, null, 2));
    console.log(`   → ${dilemmasData.length} dilemmas exported`);

    // Dump user responses
    console.log('📊 Dumping user responses...');
    const responsesData = await db.select().from(userResponses);
    fs.writeFileSync(`${dumpDir}/user_responses.json`, JSON.stringify(responsesData, null, 2));
    console.log(`   → ${responsesData.length} responses exported`);

    // Dump demographics
    console.log('👥 Dumping demographics...');
    const demographicsData = await db.select().from(userDemographics);
    fs.writeFileSync(`${dumpDir}/user_demographics.json`, JSON.stringify(demographicsData, null, 2));
    console.log(`   → ${demographicsData.length} demographic records exported`);

    // Dump LLM responses
    console.log('🤖 Dumping LLM responses...');
    const llmData = await db.select().from(llmResponses);
    fs.writeFileSync(`${dumpDir}/llm_responses.json`, JSON.stringify(llmData, null, 2));
    console.log(`   → ${llmData.length} LLM responses exported`);

    // Dump frameworks
    console.log('🧭 Dumping frameworks...');
    const frameworksData = await db.select().from(frameworks);
    fs.writeFileSync(`${dumpDir}/frameworks.json`, JSON.stringify(frameworksData, null, 2));
    console.log(`   → ${frameworksData.length} frameworks exported`);

    // Dump motifs
    console.log('🎭 Dumping motifs...');
    const motifsData = await db.select().from(motifs);
    fs.writeFileSync(`${dumpDir}/motifs.json`, JSON.stringify(motifsData, null, 2));
    console.log(`   → ${motifsData.length} motifs exported`);

    // Create summary
    const summary = {
      timestamp: new Date().toISOString(),
      tables: {
        dilemmas: dilemmasData.length,
        userResponses: responsesData.length,
        userDemographics: demographicsData.length,
        llmResponses: llmData.length,
        frameworks: frameworksData.length,
        motifs: motifsData.length
      },
      totalRecords: dilemmasData.length + responsesData.length + demographicsData.length + 
                   llmData.length + frameworksData.length + motifsData.length
    };

    fs.writeFileSync(`${dumpDir}/summary.json`, JSON.stringify(summary, null, 2));

    console.log(`\n✅ Database dump completed: ${dumpDir}`);
    console.log(`📊 Total records: ${summary.totalRecords}`);
    
    return dumpDir;

  } catch (error) {
    console.error('❌ Database dump failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createDatabaseDump()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createDatabaseDump };