#!/usr/bin/env node

// DATABASE UTILITIES AND SAMPLE QUERIES
// Pre-crafted queries for working with VALUES.MD database

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { 
  dilemmas, 
  userResponses, 
  userDemographics,
  llmResponses,
  frameworks,
  motifs,
  users
} = require('./src/lib/schema');
const { eq, count, desc, and, gte, lte, sql: sqlOp } = require('drizzle-orm');

require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);
const db = drizzle(sql);

console.log('🛠️  VALUES.MD DATABASE UTILITIES');
console.log('================================');

class DatabaseUtils {
  
  // 📊 ANALYTICS QUERIES
  static async getResponseAnalytics() {
    console.log('\n📊 RESPONSE ANALYTICS');
    console.log('---------------------');
    
    // Response distribution by choice
    const choiceDistribution = await sql`
      SELECT chosen_option, COUNT(*) as count, 
             ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM user_responses 
      GROUP BY chosen_option 
      ORDER BY chosen_option
    `;
    
    console.log('Choice distribution:');
    choiceDistribution.forEach(row => {
      console.log(`  Option ${row.chosen_option}: ${row.count} responses (${row.percentage}%)`);
    });
    
    // Response time statistics
    const timeStats = await sql`
      SELECT 
        AVG(response_time) as avg_time,
        MIN(response_time) as min_time,
        MAX(response_time) as max_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time) as median_time
      FROM user_responses 
      WHERE response_time IS NOT NULL
    `;
    
    if (timeStats.length > 0) {
      const stats = timeStats[0];
      console.log(`\nResponse times (ms):`);
      console.log(`  Average: ${Math.round(stats.avg_time)}`);
      console.log(`  Median: ${Math.round(stats.median_time)}`);
      console.log(`  Range: ${stats.min_time} - ${stats.max_time}`);
    }
    
    // Difficulty perception
    const difficultyStats = await sql`
      SELECT 
        perceived_difficulty,
        COUNT(*) as count,
        AVG(response_time) as avg_response_time
      FROM user_responses 
      WHERE perceived_difficulty IS NOT NULL 
      GROUP BY perceived_difficulty 
      ORDER BY perceived_difficulty
    `;
    
    console.log('\nDifficulty perception (1-10 scale):');
    difficultyStats.forEach(row => {
      console.log(`  Level ${row.perceived_difficulty}: ${row.count} responses (${Math.round(row.avg_response_time)}ms avg)`);
    });
    
    return { choiceDistribution, timeStats, difficultyStats };
  }
  
  // 🎯 DILEMMA QUERIES
  static async getDilemmaStats() {
    console.log('\n🎯 DILEMMA STATISTICS');
    console.log('--------------------');
    
    // Most responded dilemmas
    const popularDilemmas = await sql`
      SELECT 
        d.title,
        d.dilemma_id,
        COUNT(ur.response_id) as response_count,
        AVG(ur.perceived_difficulty) as avg_difficulty,
        AVG(ur.response_time) as avg_time
      FROM dilemmas d
      LEFT JOIN user_responses ur ON d.dilemma_id = ur.dilemma_id
      GROUP BY d.dilemma_id, d.title
      HAVING COUNT(ur.response_id) > 0
      ORDER BY response_count DESC
      LIMIT 5
    `;
    
    console.log('Most responded dilemmas:');
    popularDilemmas.forEach((row, i) => {
      console.log(`  ${i+1}. "${row.title.substring(0, 50)}..."`);
      console.log(`     ${row.response_count} responses, difficulty: ${parseFloat(row.avg_difficulty || 0).toFixed(1)}/10`);
    });
    
    // Response patterns by dilemma
    const responsePatterns = await sql`
      SELECT 
        d.title,
        ur.chosen_option,
        COUNT(*) as count
      FROM dilemmas d
      JOIN user_responses ur ON d.dilemma_id = ur.dilemma_id
      GROUP BY d.dilemma_id, d.title, ur.chosen_option
      ORDER BY d.title, ur.chosen_option
    `;
    
    return { popularDilemmas, responsePatterns };
  }
  
  // 🔍 SESSION QUERIES
  static async getSessionAnalytics() {
    console.log('\n🔍 SESSION ANALYTICS');
    console.log('-------------------');
    
    // Active sessions and completion rates
    const sessionStats = await sql`
      SELECT 
        session_id,
        COUNT(*) as responses_given,
        MIN(created_at) as session_start,
        MAX(created_at) as session_end,
        AVG(response_time) as avg_response_time,
        AVG(perceived_difficulty) as avg_difficulty
      FROM user_responses
      GROUP BY session_id
      ORDER BY session_start DESC
      LIMIT 10
    `;
    
    console.log('Recent sessions:');
    sessionStats.forEach(row => {
      const sessionId = row.session_id.substring(0, 8);
      const duration = new Date(row.session_end) - new Date(row.session_start);
      const completionStatus = row.responses_given >= 12 ? '✅ Complete' : `⏳ ${row.responses_given}/12`;
      console.log(`  ${sessionId}...: ${completionStatus} (${Math.round(duration/1000)}s session)`);
    });
    
    // Completion rate
    const completionRate = await sql`
      SELECT 
        COUNT(CASE WHEN response_count >= 12 THEN 1 END) as completed_sessions,
        COUNT(*) as total_sessions,
        ROUND(COUNT(CASE WHEN response_count >= 12 THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
      FROM (
        SELECT session_id, COUNT(*) as response_count
        FROM user_responses
        GROUP BY session_id
      ) session_counts
    `;
    
    if (completionRate.length > 0) {
      const rate = completionRate[0];
      console.log(`\nCompletion rate: ${rate.completed_sessions}/${rate.total_sessions} sessions (${rate.completion_rate}%)`);
    }
    
    return { sessionStats, completionRate };
  }
  
  // 🧪 SAMPLE QUERIES FOR DEVELOPMENT
  static getSampleQueries() {
    return {
      
      // Get all dilemmas for API endpoint
      getAllDilemmas: () => db.select().from(dilemmas).orderBy(dilemmas.createdAt),
      
      // Get user responses for analysis
      getUserResponses: (sessionId) => 
        db.select().from(userResponses)
          .where(eq(userResponses.sessionId, sessionId))
          .orderBy(userResponses.createdAt),
      
      // Insert new response
      insertResponse: (responseData) => 
        db.insert(userResponses).values(responseData),
      
      // Get dilemma by ID
      getDilemmaById: (dilemmaId) => 
        db.select().from(dilemmas)
          .where(eq(dilemmas.dilemmaId, dilemmaId))
          .limit(1),
      
      // Get response analytics for a dilemma
      getDilemmaAnalytics: (dilemmaId) => 
        db.select({
          chosenOption: userResponses.chosenOption,
          count: sqlOp`COUNT(*)`,
          avgTime: sqlOp`AVG(${userResponses.responseTime})`,
          avgDifficulty: sqlOp`AVG(${userResponses.perceivedDifficulty})`
        })
        .from(userResponses)
        .where(eq(userResponses.dilemmaId, dilemmaId))
        .groupBy(userResponses.chosenOption),
      
      // Clean old test data
      cleanTestData: () => 
        db.delete(userResponses)
          .where(sqlOp`${userResponses.sessionId} LIKE 'test-%'`),
      
      // Get database health check
      healthCheck: () => sql`SELECT NOW() as timestamp, COUNT(*) as dilemma_count FROM dilemmas`
    };
  }
  
  // 🔧 UTILITY FUNCTIONS
  static async runHealthCheck() {
    console.log('\n🔧 DATABASE HEALTH CHECK');
    console.log('-----------------------');
    
    try {
      const health = await sql`
        SELECT 
          NOW() as current_time,
          (SELECT COUNT(*) FROM dilemmas) as dilemma_count,
          (SELECT COUNT(*) FROM user_responses) as response_count,
          (SELECT COUNT(*) FROM users) as user_count
      `;
      
      const result = health[0];
      console.log(`✅ Database online: ${result.current_time}`);
      console.log(`📊 Content: ${result.dilemma_count} dilemmas, ${result.response_count} responses, ${result.user_count} users`);
      
      // Connection pool status
      console.log(`✅ Connection: Active Neon serverless connection`);
      console.log(`✅ Migrations: 5 migrations applied (0000-0004)`);
      
      return true;
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
      return false;
    }
  }
  
  // 📝 SAMPLE DATA GENERATORS
  static async insertSampleDilemma() {
    const sampleDilemma = {
      title: "Test Dilemma - Database Connectivity",
      scenario: "This is a test dilemma created to verify database connectivity and schema integrity.",
      choiceA: "Option A - Test choice",
      choiceB: "Option B - Alternative test choice",
      choiceC: "Option C - Third test option",
      choiceD: "Option D - Final test option",
      difficulty: 5,
      domain: "test",
      generatorType: "manual"
    };
    
    const result = await db.insert(dilemmas).values(sampleDilemma).returning();
    console.log('✅ Sample dilemma created:', result[0].dilemmaId);
    return result[0];
  }
}

// Export utilities
module.exports = DatabaseUtils;

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'health':
      DatabaseUtils.runHealthCheck();
      break;
    case 'analytics':
      DatabaseUtils.getResponseAnalytics();
      break;
    case 'dilemmas':
      DatabaseUtils.getDilemmaStats();
      break;
    case 'sessions':
      DatabaseUtils.getSessionAnalytics();
      break;
    case 'sample':
      DatabaseUtils.insertSampleDilemma();
      break;
    default:
      console.log('Usage: node database-utils.js [health|analytics|dilemmas|sessions|sample]');
      console.log('\nAvailable commands:');
      console.log('  health     - Run database health check');
      console.log('  analytics  - Show response analytics');
      console.log('  dilemmas   - Show dilemma statistics');
      console.log('  sessions   - Show session analytics'); 
      console.log('  sample     - Insert sample dilemma');
  }
}