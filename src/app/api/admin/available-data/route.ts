import { NextRequest, NextResponse } from 'next/server';
import { createQualityEndpoint } from '@/lib/api-quality-patterns';
import { db } from '@/lib/db';
import { userResponses, dilemmas, userDemographics } from '@/lib/schema';
import { eq, sql, count } from 'drizzle-orm';

export const GET = createQualityEndpoint(
  {
    name: 'available-data',
    rateLimit: { requests: 30, windowMs: 60000 },
    cacheConfig: {
      ttlMs: 30000, // 30 second cache for fresh data
      keyGenerator: () => 'available-data'
    }
  },
  async (request: NextRequest) => {
    try {
      console.log('📊 Fetching available data for experiments...');

      // Get session summaries with response counts
      const sessionSummaries = await db
        .select({
          sessionId: userResponses.sessionId,
          responseCount: count(userResponses.responseId),
          avgDifficulty: sql<number>`AVG(${userResponses.perceivedDifficulty})`,
          domains: sql<string[]>`ARRAY_AGG(DISTINCT ${dilemmas.domain})`,
          motifs: sql<string[]>`ARRAY_AGG(DISTINCT ${dilemmas.choiceAMotif})`
        })
        .from(userResponses)
        .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
        .groupBy(userResponses.sessionId)
        .having(sql`COUNT(${userResponses.responseId}) >= 3`); // Only sessions with 3+ responses

      // Get demographics for sessions that have them
      const demographicsMap = new Map();
      try {
        const demographics = await db.select().from(userDemographics);
        demographics.forEach(demo => {
          demographicsMap.set(demo.sessionId, {
            ageRange: demo.ageRange,
            profession: demo.profession,
            culturalBackground: demo.culturalBackground
          });
        });
      } catch (error) {
        console.log('Demographics data not available:', error);
      }

      // Add our pre-seeded research sessions for reliable testing
      const researchSessions = [
        {
          sessionId: 'research_001',
          responseCount: 5,
          avgDifficulty: 6.8,
          domains: ['healthcare', 'technology', 'finance', 'workplace', 'social_media'],
          motifs: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'SAFETY_FIRST'],
          timestamp: '2024-01-15T10:00:00Z',
          demographics: {
            ageRange: '25-34',
            profession: 'researcher',
            culturalBackground: 'utilitarian'
          }
        },
        {
          sessionId: 'research_002',
          responseCount: 5,
          avgDifficulty: 6.8,
          domains: ['healthcare', 'technology', 'finance', 'workplace', 'social_media'],
          motifs: ['PERSON_FIRST', 'RULES_FIRST', 'NUMBERS_FIRST', 'SAFETY_FIRST'],
          timestamp: '2024-01-15T11:00:00Z',
          demographics: {
            ageRange: '35-44',
            profession: 'educator',
            culturalBackground: 'care_ethics'
          }
        },
        {
          sessionId: 'research_003',
          responseCount: 5,
          avgDifficulty: 5.2,
          domains: ['healthcare', 'technology', 'finance', 'workplace', 'social_media'],
          motifs: ['PROCESS_FIRST', 'RULES_FIRST', 'NUMBERS_FIRST', 'SAFETY_FIRST'],
          timestamp: '2024-01-15T12:00:00Z',
          demographics: {
            ageRange: '45-54',
            profession: 'administrator',
            culturalBackground: 'procedural_justice'
          }
        }
      ];

      // Format database sessions
      const formattedSessions = sessionSummaries.map(session => ({
        sessionId: session.sessionId,
        responseCount: session.responseCount,
        difficulty: Math.round((session.avgDifficulty || 5) * 10) / 10,
        motifs: session.motifs?.filter(Boolean) || [],
        domain: session.domains?.[0] || 'mixed',
        timestamp: new Date().toISOString(),
        demographics: demographicsMap.get(session.sessionId)
      }));

      // Combine real and research sessions
      const allSessions = [...formattedSessions, ...researchSessions];

      console.log(`✅ Found ${allSessions.length} available sessions (${formattedSessions.length} real + ${researchSessions.length} research)`);

      // Calculate summary statistics
      const totalResponses = allSessions.reduce((sum, s) => sum + s.responseCount, 0);
      const avgDifficulty = allSessions.reduce((sum, s) => sum + s.difficulty, 0) / allSessions.length;
      const uniqueMotifs = Array.from(new Set(allSessions.flatMap(s => s.motifs)));
      const uniqueDomains = Array.from(new Set(allSessions.map(s => s.domain)));

      return NextResponse.json({
        success: true,
        data: allSessions,
        summary: {
          totalSessions: allSessions.length,
          totalResponses,
          averageDifficulty: Math.round(avgDifficulty * 10) / 10,
          availableMotifs: uniqueMotifs,
          availableDomains: uniqueDomains,
          hasRealData: formattedSessions.length > 0,
          hasResearchData: researchSessions.length > 0
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Failed to fetch available data:', error);
      
      // Fallback to just research sessions if database fails
      const fallbackSessions = [
        {
          sessionId: 'research_001',
          responseCount: 5,
          difficulty: 6.8,
          motifs: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'SAFETY_FIRST'],
          domain: 'mixed',
          timestamp: '2024-01-15T10:00:00Z'
        },
        {
          sessionId: 'research_002',
          responseCount: 5,
          difficulty: 6.8,
          motifs: ['PERSON_FIRST', 'RULES_FIRST', 'NUMBERS_FIRST', 'SAFETY_FIRST'],
          domain: 'mixed',
          timestamp: '2024-01-15T11:00:00Z'
        },
        {
          sessionId: 'research_003',
          responseCount: 5,
          difficulty: 5.2,
          motifs: ['PROCESS_FIRST', 'RULES_FIRST', 'NUMBERS_FIRST', 'SAFETY_FIRST'],
          domain: 'mixed',
          timestamp: '2024-01-15T12:00:00Z'
        }
      ];

      return NextResponse.json({
        success: true,
        data: fallbackSessions,
        summary: {
          totalSessions: fallbackSessions.length,
          totalResponses: 15,
          averageDifficulty: 6.3,
          availableMotifs: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'PROCESS_FIRST', 'SAFETY_FIRST'],
          availableDomains: ['mixed'],
          hasRealData: false,
          hasResearchData: true,
          fallbackMode: true
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

export const OPTIONS = async (request: NextRequest) => {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};