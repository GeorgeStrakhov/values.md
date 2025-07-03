import { pgTable, varchar, text, integer, decimal, timestamp, boolean, uuid, primaryKey } from 'drizzle-orm/pg-core';

// Ethical frameworks taxonomy
export const frameworks = pgTable('frameworks', {
  frameworkId: varchar('framework_id').primaryKey(),
  name: varchar('name').notNull(),
  tradition: varchar('tradition'),
  keyPrinciple: text('key_principle'),
  decisionMethod: text('decision_method'),
  lexicalIndicators: text('lexical_indicators'),
  computationalSignature: text('computational_signature'),
  historicalFigure: varchar('historical_figure'),
  modernApplication: text('modern_application'),
});

// Moral motifs (behavioral patterns)
export const motifs = pgTable('motifs', {
  motifId: varchar('motif_id').primaryKey(),
  name: varchar('name').notNull(),
  category: varchar('category'),
  subcategory: varchar('subcategory'),
  description: text('description'),
  lexicalIndicators: text('lexical_indicators'),
  behavioralIndicators: text('behavioral_indicators'),
  logicalPatterns: text('logical_patterns'),
  conflictsWith: text('conflicts_with'),
  synergiesWith: text('synergies_with'),
  weight: decimal('weight'),
  culturalVariance: varchar('cultural_variance'),
  cognitiveLoad: varchar('cognitive_load'),
});

// Ethical dilemma scenarios
export const dilemmas = pgTable('dilemmas', {
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

// User responses (anonymous)
export const userResponses = pgTable('user_responses', {
  responseId: uuid('response_id').defaultRandom().primaryKey(),
  sessionId: varchar('session_id').notNull(),
  dilemmaId: uuid('dilemma_id').notNull().references(() => dilemmas.dilemmaId),
  chosenOption: varchar('chosen_option').notNull(), // a, b, c, or d
  reasoning: text('reasoning'),
  responseTime: integer('response_time'), // milliseconds
  perceivedDifficulty: integer('perceived_difficulty'), // 1-10 scale
  createdAt: timestamp('created_at').defaultNow(),
});

// User demographics (optional, anonymous)
export const userDemographics = pgTable('user_demographics', {
  sessionId: varchar('session_id').primaryKey(),
  ageRange: varchar('age_range'),
  educationLevel: varchar('education_level'),
  culturalBackground: varchar('cultural_background'),
  profession: varchar('profession'),
  professionalContext: varchar('professional_context'), // workplace, academic, personal
  geographicRegion: varchar('geographic_region'),
  primaryLanguage: varchar('primary_language'),
  consentResearch: boolean('consent_research').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// LLM baseline responses
export const llmResponses = pgTable('llm_responses', {
  llmId: varchar('llm_id').notNull(),
  modelName: varchar('model_name').notNull(),
  dilemmaId: uuid('dilemma_id').notNull().references(() => dilemmas.dilemmaId),
  chosenOption: varchar('chosen_option').notNull(),
  reasoning: text('reasoning'),
  confidenceScore: decimal('confidence_score'),
  createdAt: timestamp('created_at').defaultNow(),
});

// LLM alignment experiments - testing different values.md compositions
export const llmAlignmentExperiments = pgTable('llm_alignment_experiments', {
  experimentId: uuid('experiment_id').defaultRandom().primaryKey(),
  humanSessionId: varchar('human_session_id').notNull(),
  templateType: varchar('template_type').notNull(), // enhanced, narrative, minimalist, framework, stakeholder
  modelName: varchar('model_name').notNull(),
  valuesDocument: text('values_document').notNull(),
  testDilemmaId: uuid('test_dilemma_id').notNull().references(() => dilemmas.dilemmaId),
  humanChoice: varchar('human_choice').notNull(),
  llmChoice: varchar('llm_choice').notNull(),
  llmReasoning: text('llm_reasoning'),
  alignmentScore: decimal('alignment_score'), // 0-100 how well LLM matched human
  confidenceScore: decimal('confidence_score'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Auth.js required tables
export const users = pgTable('users', {
  id: varchar('id').notNull().primaryKey(),
  name: varchar('name'),
  email: varchar('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: varchar('image'),
  role: varchar('role').default('user'),
  password: varchar('password'), // For admin users
});

export const accounts = pgTable('accounts', {
  userId: varchar('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type').notNull(),
  provider: varchar('provider').notNull(),
  providerAccountId: varchar('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type'),
  scope: varchar('scope'),
  id_token: text('id_token'),
  session_state: varchar('session_state'),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: varchar('sessionToken').notNull().primaryKey(),
  userId: varchar('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationTokens', {
  identifier: varchar('identifier').notNull(),
  token: varchar('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export type Framework = typeof frameworks.$inferSelect;
export type Motif = typeof motifs.$inferSelect;
export type Dilemma = typeof dilemmas.$inferSelect;
export type UserResponse = typeof userResponses.$inferSelect;
export type UserDemographics = typeof userDemographics.$inferSelect;
export type LlmResponse = typeof llmResponses.$inferSelect;
export type LlmAlignmentExperiment = typeof llmAlignmentExperiments.$inferSelect;
export type User = typeof users.$inferSelect;