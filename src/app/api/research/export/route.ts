import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, userDemographics } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'responses' | 'dilemmas' | 'demographics';

    if (!type || !['responses', 'dilemmas', 'demographics'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    let csvData = '';

    switch (type) {
      case 'responses':
        csvData = await generateResponsesCSV();
        break;
      case 'dilemmas':
        csvData = await generateDilemmasCSV();
        break;
      case 'demographics':
        csvData = await generateDemographicsCSV();
        break;
    }

    const response = new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="values-${type}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

    return response;
  } catch (error) {
    console.error('Error exporting research data:', error);
    return NextResponse.json(
      { error: 'Failed to export research data' },
      { status: 500 }
    );
  }
}

async function generateResponsesCSV(): Promise<string> {
  const responses = await db.select().from(userResponses);
  
  const headers = [
    'session_id',
    'dilemma_id',
    'chosen_option',
    'reasoning',
    'response_time',
    'perceived_difficulty',
    'created_at'
  ];

  const rows = responses.map(response => [
    response.sessionId,
    response.dilemmaId,
    response.chosenOption,
    `"${(response.reasoning || '').replace(/"/g, '""')}"`, // Escape quotes
    response.responseTime,
    response.perceivedDifficulty,
    response.createdAt?.toISOString()
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

async function generateDilemmasCSV(): Promise<string> {
  const dilemmaData = await db.select().from(dilemmas);
  
  const headers = [
    'dilemma_id',
    'domain',
    'difficulty',
    'title',
    'scenario',
    'choice_a',
    'choice_a_motif',
    'choice_b',
    'choice_b_motif',
    'choice_c',
    'choice_c_motif',
    'choice_d',
    'choice_d_motif',
    'target_motifs',
    'cultural_context',
    'created_at'
  ];

  const rows = dilemmaData.map(dilemma => [
    dilemma.dilemmaId,
    dilemma.domain,
    dilemma.difficulty,
    `"${(dilemma.title || '').replace(/"/g, '""')}"`,
    `"${(dilemma.scenario || '').replace(/"/g, '""')}"`,
    `"${(dilemma.choiceA || '').replace(/"/g, '""')}"`,
    dilemma.choiceAMotif,
    `"${(dilemma.choiceB || '').replace(/"/g, '""')}"`,
    dilemma.choiceBMotif,
    `"${(dilemma.choiceC || '').replace(/"/g, '""')}"`,
    dilemma.choiceCMotif,
    `"${(dilemma.choiceD || '').replace(/"/g, '""')}"`,
    dilemma.choiceDMotif,
    dilemma.targetMotifs,
    dilemma.culturalContext,
    dilemma.createdAt?.toISOString()
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

async function generateDemographicsCSV(): Promise<string> {
  const demographics = await db.select().from(userDemographics);
  
  const headers = [
    'session_id',
    'age_range',
    'education_level',
    'cultural_background',
    'profession',
    'consent_research',
    'created_at'
  ];

  const rows = demographics.map(demo => [
    demo.sessionId,
    demo.ageRange,
    demo.educationLevel,
    demo.culturalBackground,
    demo.profession,
    demo.consentResearch,
    demo.createdAt?.toISOString()
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}