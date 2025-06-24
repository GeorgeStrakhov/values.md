import { db } from '@/lib/db';
import { 
  dilemmas, 
  userResponses, 
  userDemographics, 
  llmResponses,
  frameworks,
  motifs,
  users
} from '@/lib/schema';
import { sql } from 'drizzle-orm';

async function generateDatabaseReport() {
  console.log('🔍 VALUES.MD DATABASE REPORT');
  console.log('================================\n');

  try {
    // Table counts
    console.log('📊 TABLE COUNTS:');
    const dilemmaPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(dilemmas);
    const dilemmaCount = (await dilemmaPrefixTasks)[0]?.count || 0;
    
    const responsePrefixTasks = db.select({ count: sql<number>`count(*)` }).from(userResponses);
    const responseCount = (await responsePrefixTasks)[0]?.count || 0;
    
    const demographicPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(userDemographics);
    const demographicCount = (await demographicPrefixTasks)[0]?.count || 0;
    
    const llmPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(llmResponses);
    const llmCount = (await llmPrefixTasks)[0]?.count || 0;
    
    const frameworkPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(frameworks);
    const frameworkCount = (await frameworkPrefixTasks)[0]?.count || 0;
    
    const motifPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(motifs);
    const motifCount = (await motifPrefixTasks)[0]?.count || 0;
    
    const userPrefixTasks = db.select({ count: sql<number>`count(*)` }).from(users);
    const userCount = (await userPrefixTasks)[0]?.count || 0;

    console.log(`- Dilemmas: ${dilemmaCount}`);
    console.log(`- User Responses: ${responseCount}`);
    console.log(`- User Demographics: ${demographicCount}`);
    console.log(`- LLM Responses: ${llmCount}`);
    console.log(`- Frameworks: ${frameworkCount}`);
    console.log(`- Motifs: ${motifCount}`);
    console.log(`- Users: ${userCount}\n`);

    // Sample dilemmas
    if (dilemmaCount > 0) {
      console.log('📝 SAMPLE DILEMMAS:');
      const sampleDilemmas = await db
        .select({
          id: dilemmas.dilemmaId,
          title: dilemmas.title,
          domain: dilemmas.domain,
          difficulty: dilemmas.difficulty,
          created: dilemmas.createdAt
        })
        .from(dilemmas)
        .limit(5);

      sampleDilemmas.forEach((d, i) => {
        console.log(`${i + 1}. [${d.domain}] ${d.title} (Difficulty: ${d.difficulty})`);
        console.log(`   ID: ${d.id}`);
        console.log(`   Created: ${d.created}\n`);
      });
    }

    // Response analysis
    if (responseCount > 0) {
      console.log('📊 RESPONSE ANALYSIS:');
      
      // Unique sessions
      const uniqueSessionsPrefixTasks = db
        .select({ count: sql<number>`count(distinct session_id)` })
        .from(userResponses);
      const uniqueSessions = (await uniqueSessionsPrefixTasks)[0]?.count || 0;
      console.log(`- Unique Sessions: ${uniqueSessions}`);

      // Response distribution by option
      const optionDistributionPrefixTasks = db
        .select({
          option: userResponses.chosenOption,
          count: sql<number>`count(*)`
        })
        .from(userResponses)
        .groupBy(userResponses.chosenOption);
      const optionDistribution = await optionDistributionPrefixTasks;
      
      console.log('- Choice Distribution:');
      optionDistribution.forEach(opt => {
        console.log(`  ${opt.option.toUpperCase()}: ${opt.count} responses`);
      });

      // Recent sessions
      console.log('\n📅 RECENT SESSIONS:');
      const recentSessionsPrefixTasks = db
        .select({
          sessionId: userResponses.sessionId,
          count: sql<number>`count(*)`,
          lastResponse: sql<Date>`max(created_at)`
        })
        .from(userResponses)
        .groupBy(userResponses.sessionId)
        .orderBy(sql`max(created_at) desc`)
        .limit(10);
      const recentSessions = await recentSessionsPrefixTasks;

      recentSessions.forEach((session, i) => {
        console.log(`${i + 1}. ${session.sessionId} - ${session.count} responses (${session.lastResponse})`);
      });
    }

    // Framework and motif data
    if (frameworkCount > 0) {
      console.log('\n🧭 ETHICAL FRAMEWORKS:');
      const frameworkListPrefixTasks = db
        .select({
          id: frameworks.frameworkId,
          name: frameworks.name,
          tradition: frameworks.tradition
        })
        .from(frameworks)
        .limit(10);
      const frameworkList = await frameworkListPrefixTasks;

      frameworkList.forEach((f, i) => {
        console.log(`${i + 1}. ${f.name} (${f.tradition})`);
      });
    }

    if (motifCount > 0) {
      console.log('\n🎭 MORAL MOTIFS:');
      const motifListPrefixTasks = db
        .select({
          id: motifs.motifId,
          name: motifs.name,
          category: motifs.category
        })
        .from(motifs)
        .limit(10);
      const motifList = await motifListPrefixTasks;

      motifList.forEach((m, i) => {
        console.log(`${i + 1}. ${m.name} (${m.category})`);
      });
    }

    console.log('\n✅ Database report completed successfully');

  } catch (error) {
    console.error('❌ Database report failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateDatabaseReport()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateDatabaseReport };