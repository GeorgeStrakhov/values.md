import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { dilemmas, motifs, frameworks } from '@/lib/schema';

// Sample dilemmas for immediate testing
const SAMPLE_DILEMMAS = [
  {
    dilemmaId: 'DM001',
    domain: 'healthcare',
    generatorType: 'binary_conflict',
    difficulty: 7,
    title: 'Emergency Resource Allocation',
    scenario: 'A hospital AI system has one ventilator left during a pandemic surge. Patient A is a 25-year-old with 85% survival odds but no health insurance. Patient B is a 65-year-old healthcare worker with 70% survival odds and full insurance. The decision must be made immediately as both patients are deteriorating rapidly.',
    choiceA: 'Allocate to Patient A - maximize survival probability and years of life saved',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Allocate to Patient B - honor the healthcare worker\'s service and sacrifice',
    choiceBMotif: 'PERSON_FIRST', 
    choiceC: 'Follow hospital triage protocol based on first-arrival time',
    choiceCMotif: 'PROCESS_FIRST',
    choiceD: 'Consult ethics committee despite time constraints',
    choiceDMotif: 'RULES_FIRST',
    targetMotifs: 'NUMBERS_FIRST,PERSON_FIRST,PROCESS_FIRST',
    stakeholders: 'patients,families,hospital_staff,healthcare_system',
    culturalContext: 'western_liberal',
    validationScore: 9.2,
    realismScore: 8.8,
    tensionStrength: 9.5
  },
  {
    dilemmaId: 'DM002',
    domain: 'technology',
    generatorType: 'stakeholder_mapping',
    difficulty: 8,
    title: 'AI Assistant Data Privacy',
    scenario: 'Your AI assistant could provide much better recommendations if it accessed your browsing history, location data, and purchase records. This would violate privacy but significantly improve service quality and convenience.',
    choiceA: 'Allow full data access - maximize the utility and helpfulness of the AI',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Refuse all data access - privacy is non-negotiable',
    choiceBMotif: 'RULES_FIRST',
    choiceC: 'Allow limited access based on my specific comfort level',
    choiceCMotif: 'PERSON_FIRST',
    choiceD: 'Implement transparent consent process with clear controls',
    choiceDMotif: 'PROCESS_FIRST',
    targetMotifs: 'NUMBERS_FIRST,RULES_FIRST,PERSON_FIRST,PROCESS_FIRST',
    stakeholders: 'individual_users,tech_companies,privacy_advocates',
    culturalContext: 'digital_native',
    validationScore: 8.5,
    realismScore: 9.1,
    tensionStrength: 8.7
  },
  {
    dilemmaId: 'DM003',
    domain: 'finance',
    generatorType: 'temporal_scaling',
    difficulty: 6,
    title: 'Investment Risk vs Safety',
    scenario: 'You\'re 30 years old with $50,000 saved. You can choose: aggressive investing (potential 10% returns, risk of 30% loss), moderate approach (6% returns, 10% loss risk), or conservative savings (3% guaranteed).',
    choiceA: 'Choose aggressive portfolio - maximize expected long-term returns',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Choose conservative approach - never risk money you can\'t afford to lose',
    choiceBMotif: 'SAFETY_FIRST',
    choiceC: 'Consider my specific goals, family situation, and stress tolerance',
    choiceCMotif: 'PERSON_FIRST',
    choiceD: 'Follow standard allocation model based on age and risk assessment',
    choiceDMotif: 'PROCESS_FIRST',
    targetMotifs: 'NUMBERS_FIRST,SAFETY_FIRST,PERSON_FIRST,PROCESS_FIRST',
    stakeholders: 'individual_investors,families,financial_advisors',
    culturalContext: 'western_liberal',
    validationScore: 8.0,
    realismScore: 9.0,
    tensionStrength: 7.5
  },
  {
    dilemmaId: 'DM004',
    domain: 'workplace',
    generatorType: 'motif_amplification',
    difficulty: 5,
    title: 'Workplace AI Monitoring',
    scenario: 'Your company wants to use AI to monitor employee productivity, catching people who slack off but also potentially flagging family emergencies, health issues, or personal struggles as "poor performance".',
    choiceA: 'Support monitoring - improve overall productivity and fairness',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Oppose monitoring - employee privacy rights are fundamental',
    choiceBMotif: 'RULES_FIRST',
    choiceC: 'Consider individual circumstances and personal situations',
    choiceCMotif: 'PERSON_FIRST',
    choiceD: 'Implement fair, transparent monitoring with clear appeals process',
    choiceDMotif: 'PROCESS_FIRST',
    targetMotifs: 'NUMBERS_FIRST,RULES_FIRST,PERSON_FIRST,PROCESS_FIRST',
    stakeholders: 'employees,management,hr_departments,unions',
    culturalContext: 'corporate',
    validationScore: 7.8,
    realismScore: 8.5,
    tensionStrength: 8.2
  },
  {
    dilemmaId: 'DM005',
    domain: 'social_media',
    generatorType: 'binary_conflict',
    difficulty: 7,
    title: 'Content Moderation Dilemma',
    scenario: 'AI detects potentially harmful health misinformation spreading rapidly. The content is a grieving parent sharing their personal experience with a vaccine side effect. Removing it could silence legitimate personal experience while potentially saving lives.',
    choiceA: 'Remove immediately - calculate harm prevented vs. individual silenced',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Never remove personal experiences - free speech is absolute',
    choiceBMotif: 'RULES_FIRST',
    choiceC: 'Consider this parent\'s grief and personal situation',
    choiceCMotif: 'PERSON_FIRST',
    choiceD: 'Add warnings and fact-checks rather than remove content',
    choiceDMotif: 'SAFETY_FIRST',
    targetMotifs: 'NUMBERS_FIRST,RULES_FIRST,PERSON_FIRST,SAFETY_FIRST',
    stakeholders: 'content_creators,platform_users,public_health,families',
    culturalContext: 'digital_public_sphere',
    validationScore: 8.8,
    realismScore: 9.2,
    tensionStrength: 9.1
  },
  {
    dilemmaId: 'DM006',
    domain: 'autonomous_vehicle',
    generatorType: 'stakeholder_mapping',
    difficulty: 9,
    title: 'Autonomous Vehicle Programming',
    scenario: 'Programming ethical decisions for self-driving cars. In unavoidable accidents, should the car prioritize: passengers, pedestrians, minimize total casualties, or follow traffic laws regardless of consequences?',
    choiceA: 'Minimize total casualties using probability calculations',
    choiceAMotif: 'NUMBERS_FIRST',
    choiceB: 'Always follow traffic laws regardless of consequences',
    choiceBMotif: 'RULES_FIRST',
    choiceC: 'Consider each specific accident scenario individually',
    choiceCMotif: 'PERSON_FIRST',
    choiceD: 'Design to prevent accidents, not optimize crash outcomes',
    choiceDMotif: 'SAFETY_FIRST',
    targetMotifs: 'NUMBERS_FIRST,RULES_FIRST,PERSON_FIRST,SAFETY_FIRST',
    stakeholders: 'passengers,pedestrians,families,manufacturers,regulators',
    culturalContext: 'technological_society',
    validationScore: 9.0,
    realismScore: 8.9,
    tensionStrength: 9.5
  }
];

const SAMPLE_MOTIFS = [
  {
    motifId: 'NUMBERS_FIRST',
    name: 'Numbers First',
    category: 'quantitative',
    subcategory: 'calculation',
    description: 'Mathematical optimization, quantified outcomes, explicit calculations',
    lexicalIndicators: 'calculate;maximize;optimize;numbers;percentage;probability;cost-benefit;expected value',
    behavioralIndicators: 'chooses mathematically optimal outcomes;weighs probabilities;considers aggregate effects',
    logicalPatterns: 'IF total_utility(A) > total_utility(B) THEN choose(A)',
    conflictsWith: 'RULES_FIRST,PERSON_FIRST',
    synergiesWith: 'PROCESS_FIRST',
    weight: 0.9,
    culturalVariance: 'low',
    cognitiveLoad: 'high',
  },
  {
    motifId: 'RULES_FIRST',
    name: 'Rules First',
    category: 'deontological',
    subcategory: 'categorical',
    description: 'Absolute principles, non-negotiable values, universal rules',
    lexicalIndicators: 'never;always;absolute;categorical;unconditional;without exception;fundamental;inherent',
    behavioralIndicators: 'refuses to violate rules even for good outcomes;cites universal principles',
    logicalPatterns: 'IF rule_violation(action) THEN forbidden(action) REGARDLESS consequences',
    conflictsWith: 'NUMBERS_FIRST,PERSON_FIRST',
    synergiesWith: 'PROCESS_FIRST',
    weight: 0.95,
    culturalVariance: 'high',
    cognitiveLoad: 'low',
  },
  {
    motifId: 'PERSON_FIRST',
    name: 'Person First',
    category: 'care_ethics',
    subcategory: 'particular',
    description: 'Individual focus, contextual care, specific relationships',
    lexicalIndicators: 'this person;particular case;individual needs;context;specific situation;personal',
    behavioralIndicators: 'focuses on individual rather than universal;contextual responses',
    logicalPatterns: 'respond_to(particular_other) IN specific_context',
    conflictsWith: 'NUMBERS_FIRST,RULES_FIRST',
    synergiesWith: 'SAFETY_FIRST',
    weight: 0.8,
    culturalVariance: 'very_high',
    cognitiveLoad: 'low',
  },
  {
    motifId: 'PROCESS_FIRST',
    name: 'Process First',
    category: 'justice',
    subcategory: 'procedural',
    description: 'Fair procedures, systematic approach, consistent processes',
    lexicalIndicators: 'fair process;due process;procedure;consistent;impartial;equal treatment;systematic',
    behavioralIndicators: 'insists on fair procedures;consistent application of rules',
    logicalPatterns: 'apply(procedure) CONSISTENTLY across cases',
    conflictsWith: 'PERSON_FIRST',
    synergiesWith: 'RULES_FIRST,NUMBERS_FIRST',
    weight: 0.85,
    culturalVariance: 'low',
    cognitiveLoad: 'medium',
  },
  {
    motifId: 'SAFETY_FIRST',
    name: 'Safety First',
    category: 'harm_principle',
    subcategory: 'minimize',
    description: 'Harm prevention, conservative choices, risk aversion',
    lexicalIndicators: 'minimize harm;reduce suffering;prevent damage;avoid hurt;safety first;do no harm',
    behavioralIndicators: 'consistently chooses less harmful options;prioritizes safety',
    logicalPatterns: 'minimize(total_harm) ACROSS all_affected',
    conflictsWith: 'NUMBERS_FIRST',
    synergiesWith: 'PERSON_FIRST',
    weight: 0.9,
    culturalVariance: 'low',
    cognitiveLoad: 'low',
  }
];

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authConfig);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    console.log('🗄️ Importing sample data...');

    // Clear existing data
    await db.delete(dilemmas);
    await db.delete(motifs);
    
    // Insert sample data
    await db.insert(dilemmas).values(SAMPLE_DILEMMAS);
    await db.insert(motifs).values(SAMPLE_MOTIFS);

    console.log(`✅ Imported ${SAMPLE_DILEMMAS.length} dilemmas and ${SAMPLE_MOTIFS.length} motifs`);

    return NextResponse.json({
      success: true,
      imported: {
        dilemmas: SAMPLE_DILEMMAS.length,
        motifs: SAMPLE_MOTIFS.length
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import sample data', details: error },
      { status: 500 }
    );
  }
}