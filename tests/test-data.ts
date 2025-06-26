/**
 * Test Data Factory
 * 
 * Creates consistent test data that matches our real database schema
 */

export const createTestDilemma = (overrides = {}) => ({
  dilemmaId: 'test-dilemma-001',
  title: 'Test Autonomous Vehicle Dilemma',
  scenario: 'An autonomous vehicle must choose between hitting one person or three people.',
  choiceA: 'Minimize total casualties by hitting the one person',
  choiceAMotif: 'UTIL_CALC',
  choiceB: 'Maintain course and let chance decide', 
  choiceBMotif: 'DEONT_ABSOLUTE',
  choiceC: 'Swerve to protect the passenger at all costs',
  choiceCMotif: 'CARE_PARTICULAR',
  choiceD: 'Follow traffic laws regardless of consequences',
  choiceDMotif: 'JUST_PROCEDURAL',
  domain: 'technology',
  difficulty: 7,
  targetMotifs: 'UTIL_CALC,DEONT_ABSOLUTE',
  stakeholders: 'passengers,pedestrians,society',
  culturalContext: 'western_liberal',
  ...overrides
});

export const createTestDilemmas = (count = 3) => 
  Array.from({ length: count }, (_, i) => 
    createTestDilemma({
      dilemmaId: `test-dilemma-${String(i + 1).padStart(3, '0')}`,
      title: `Test Dilemma ${i + 1}`,
    })
  );

export const createTestResponse = (overrides = {}) => ({
  dilemmaId: 'test-dilemma-001',
  chosenOption: 'a',
  reasoning: 'I chose this because it minimizes total harm.',
  responseTime: 5000,
  perceivedDifficulty: 7,
  ...overrides
});

export const createTestSession = () => ({
  sessionId: `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  responses: [
    createTestResponse({ dilemmaId: 'test-dilemma-001', chosenOption: 'a' }),
    createTestResponse({ dilemmaId: 'test-dilemma-002', chosenOption: 'b' }),
    createTestResponse({ dilemmaId: 'test-dilemma-003', chosenOption: 'c' }),
  ]
});

export const createTestMotif = (overrides = {}) => ({
  motifId: 'UTIL_CALC',
  name: 'Utilitarian Calculation',
  category: 'consequentialism',
  subcategory: 'calculation',
  description: 'Explicit mathematical/quantitative approach to maximizing utility',
  lexicalIndicators: 'calculate;maximize;optimize;utility;greatest number',
  behavioralIndicators: 'chooses mathematically optimal outcomes;weighs probabilities;considers aggregate effects',
  logicalPatterns: 'IF total_utility(A) > total_utility(B) THEN choose(A)',
  conflictsWith: 'DEONT_ABSOLUTE,VIRT_CHARACTER,CARE_PARTICULAR',
  synergiesWith: 'PRAGMA_OUTCOMES,RISK_ASSESSMENT',
  weight: '0.9',
  culturalVariance: 'low',
  cognitiveLoad: 'high',
  ...overrides
});

export const createTestFramework = (overrides = {}) => ({
  frameworkId: 'UTIL_ACT',
  name: 'Act Utilitarianism',
  tradition: 'consequentialism',
  keyPrinciple: 'Greatest good for greatest number',
  decisionMethod: 'Calculate expected utility of each action',
  lexicalIndicators: 'maximize utility;greatest happiness;aggregate welfare',
  computationalSignature: 'argmax(sum(utility_i * probability_i))',
  historicalFigure: 'Jeremy Bentham,John Stuart Mill',
  modernApplication: 'Effective Altruism movement',
  ...overrides
});

// Test data seeding for database tests
export const testSeedData = {
  motifs: [
    createTestMotif({ motifId: 'UTIL_CALC' }),
    createTestMotif({ 
      motifId: 'DEONT_ABSOLUTE',
      name: 'Absolute Deontological',
      category: 'deontological',
      description: 'Absolute moral rules regardless of consequences',
      logicalPatterns: 'IF rule_violation(action) THEN forbidden(action) REGARDLESS consequences'
    }),
    createTestMotif({
      motifId: 'CARE_PARTICULAR',
      name: 'Care for Particular',
      category: 'care_ethics',
      description: 'Responding to specific individuals and contexts',
      logicalPatterns: 'respond_to(particular_other) IN specific_context'
    }),
    createTestMotif({
      motifId: 'JUST_PROCEDURAL',
      name: 'Procedural Justice',
      category: 'justice',
      description: 'Fair processes and procedures',
      logicalPatterns: 'apply(procedure) CONSISTENTLY across cases'
    })
  ],
  frameworks: [
    createTestFramework({ frameworkId: 'UTIL_ACT' }),
    createTestFramework({
      frameworkId: 'DEONT_KANT',
      name: 'Kantian Deontology',
      tradition: 'deontological',
      keyPrinciple: 'Categorical imperative and universal law',
      computationalSignature: 'if universalizable(action) and respects_dignity(action): permitted'
    })
  ],
  dilemmas: createTestDilemmas(5)
};