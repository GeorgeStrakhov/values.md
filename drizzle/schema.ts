import { pgTable, foreignKey, uuid, varchar, text, integer, numeric, timestamp, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const experimentLlmResponses = pgTable("experiment_llm_responses", {
	responseId: uuid("response_id").defaultRandom().primaryKey().notNull(),
	batchId: uuid("batch_id"),
	scenarioId: uuid("scenario_id"),
	humanSessionId: varchar("human_session_id"),
	llmProvider: varchar("llm_provider").notNull(),
	alignmentCondition: varchar("alignment_condition").notNull(),
	valuesDocument: text("values_document"),
	chosenOption: varchar("chosen_option").notNull(),
	reasoning: text(),
	confidenceScore: integer("confidence_score"),
	responseTimeMs: integer("response_time_ms"),
	tokenCount: integer("token_count"),
	costUsd: numeric("cost_usd", { precision: 8, scale:  4 }),
	identifiedMotifs: text("identified_motifs").array(),
	consistencyWithValues: numeric("consistency_with_values"),
	choiceConfidence: varchar("choice_confidence"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [alignmentExperimentBatches.batchId],
			name: "experiment_llm_responses_batch_id_alignment_experiment_batches_"
		}),
	foreignKey({
			columns: [table.scenarioId],
			foreignColumns: [experimentTestScenarios.scenarioId],
			name: "experiment_llm_responses_scenario_id_experiment_test_scenarios_"
		}),
]);

export const experimentTestScenarios = pgTable("experiment_test_scenarios", {
	scenarioId: uuid("scenario_id").defaultRandom().primaryKey().notNull(),
	batchId: uuid("batch_id"),
	sourceDilemmaId: uuid("source_dilemma_id"),
	variationType: varchar("variation_type"),
	scenarioText: text("scenario_text").notNull(),
	choiceA: text("choice_a").notNull(),
	choiceB: text("choice_b").notNull(),
	choiceC: text("choice_c").notNull(),
	choiceD: text("choice_d").notNull(),
	expectedMotifs: jsonb("expected_motifs"),
	difficultyRating: integer("difficulty_rating"),
	domain: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [alignmentExperimentBatches.batchId],
			name: "experiment_test_scenarios_batch_id_alignment_experiment_batches"
		}),
	foreignKey({
			columns: [table.sourceDilemmaId],
			foreignColumns: [dilemmas.dilemmaId],
			name: "experiment_test_scenarios_source_dilemma_id_dilemmas_dilemma_id"
		}),
]);

export const alignmentExperimentBatches = pgTable("alignment_experiment_batches", {
	batchId: uuid("batch_id").defaultRandom().primaryKey().notNull(),
	experimentType: varchar("experiment_type").notNull(),
	description: text(),
	llmProviders: text("llm_providers").array(),
	testScenariosCount: integer("test_scenarios_count"),
	humanSessionsCount: integer("human_sessions_count"),
	status: varchar().default('queued'),
	progressPercent: integer("progress_percent").default(0),
	estimatedCostUsd: numeric("estimated_cost_usd", { precision: 10, scale:  2 }),
	actualCostUsd: numeric("actual_cost_usd", { precision: 10, scale:  2 }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const frameworks = pgTable("frameworks", {
	frameworkId: varchar("framework_id").primaryKey().notNull(),
	name: varchar().notNull(),
	tradition: varchar(),
	keyPrinciple: text("key_principle"),
	decisionMethod: text("decision_method"),
	lexicalIndicators: text("lexical_indicators"),
	computationalSignature: text("computational_signature"),
	historicalFigure: varchar("historical_figure"),
	modernApplication: text("modern_application"),
});

export const sessions = pgTable("sessions", {
	sessionToken: varchar().primaryKey().notNull(),
	userId: varchar().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const motifs = pgTable("motifs", {
	motifId: varchar("motif_id").primaryKey().notNull(),
	name: varchar().notNull(),
	category: varchar(),
	subcategory: varchar(),
	description: text(),
	lexicalIndicators: text("lexical_indicators"),
	behavioralIndicators: text("behavioral_indicators"),
	logicalPatterns: text("logical_patterns"),
	conflictsWith: text("conflicts_with"),
	synergiesWith: text("synergies_with"),
	weight: numeric(),
	culturalVariance: varchar("cultural_variance"),
	cognitiveLoad: varchar("cognitive_load"),
});

export const userResponses = pgTable("user_responses", {
	responseId: uuid("response_id").defaultRandom().primaryKey().notNull(),
	sessionId: varchar("session_id").notNull(),
	dilemmaId: uuid("dilemma_id").notNull(),
	chosenOption: varchar("chosen_option").notNull(),
	reasoning: text(),
	responseTime: integer("response_time"),
	perceivedDifficulty: integer("perceived_difficulty"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.dilemmaId],
			foreignColumns: [dilemmas.dilemmaId],
			name: "user_responses_dilemma_id_dilemmas_dilemma_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	name: varchar(),
	email: varchar().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: varchar(),
	role: varchar().default('user'),
	password: varchar(),
});

export const dilemmas = pgTable("dilemmas", {
	dilemmaId: uuid("dilemma_id").defaultRandom().primaryKey().notNull(),
	domain: varchar(),
	generatorType: varchar("generator_type"),
	difficulty: integer(),
	title: varchar().notNull(),
	scenario: text().notNull(),
	choiceA: text("choice_a").notNull(),
	choiceAMotif: varchar("choice_a_motif"),
	choiceB: text("choice_b").notNull(),
	choiceBMotif: varchar("choice_b_motif"),
	choiceC: text("choice_c").notNull(),
	choiceCMotif: varchar("choice_c_motif"),
	choiceD: text("choice_d").notNull(),
	choiceDMotif: varchar("choice_d_motif"),
	targetMotifs: text("target_motifs"),
	stakeholders: text(),
	culturalContext: varchar("cultural_context"),
	validationScore: numeric("validation_score"),
	realismScore: numeric("realism_score"),
	tensionStrength: numeric("tension_strength"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userDemographics = pgTable("user_demographics", {
	sessionId: varchar("session_id").primaryKey().notNull(),
	ageRange: varchar("age_range"),
	educationLevel: varchar("education_level"),
	culturalBackground: varchar("cultural_background"),
	profession: varchar(),
	consentResearch: boolean("consent_research").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	professionalContext: varchar("professional_context"),
	geographicRegion: varchar("geographic_region"),
	primaryLanguage: varchar("primary_language"),
});

export const llmResponses = pgTable("llm_responses", {
	llmId: varchar("llm_id").notNull(),
	modelName: varchar("model_name").notNull(),
	dilemmaId: uuid("dilemma_id").notNull(),
	chosenOption: varchar("chosen_option").notNull(),
	reasoning: text(),
	confidenceScore: numeric("confidence_score"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.dilemmaId],
			foreignColumns: [dilemmas.dilemmaId],
			name: "llm_responses_dilemma_id_dilemmas_dilemma_id_fk"
		}),
]);

export const experimentConsistencyAnalysis = pgTable("experiment_consistency_analysis", {
	analysisId: uuid("analysis_id").defaultRandom().primaryKey().notNull(),
	batchId: uuid("batch_id"),
	humanSessionId: varchar("human_session_id"),
	llmProvider: varchar("llm_provider"),
	scenarioCount: integer("scenario_count"),
	consistentChoices: integer("consistent_choices"),
	consistencyPercentage: numeric("consistency_percentage"),
	baselineAccuracy: numeric("baseline_accuracy"),
	alignedAccuracy: numeric("aligned_accuracy"),
	improvementDelta: numeric("improvement_delta"),
	motifConsistency: jsonb("motif_consistency"),
	dominantMotifs: text("dominant_motifs").array(),
	conflictingChoices: integer("conflicting_choices"),
	statisticalSignificance: numeric("statistical_significance"),
	sampleSize: integer("sample_size"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [alignmentExperimentBatches.batchId],
			name: "experiment_consistency_analysis_batch_id_alignment_experiment_b"
		}),
]);

export const llmAlignmentExperiments = pgTable("llm_alignment_experiments", {
	experimentId: uuid("experiment_id").defaultRandom().primaryKey().notNull(),
	humanSessionId: varchar("human_session_id").notNull(),
	templateType: varchar("template_type").notNull(),
	modelName: varchar("model_name").notNull(),
	valuesDocument: text("values_document").notNull(),
	testDilemmaId: uuid("test_dilemma_id").notNull(),
	humanChoice: varchar("human_choice").notNull(),
	llmChoice: varchar("llm_choice").notNull(),
	llmReasoning: text("llm_reasoning"),
	alignmentScore: numeric("alignment_score"),
	confidenceScore: numeric("confidence_score"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.testDilemmaId],
			foreignColumns: [dilemmas.dilemmaId],
			name: "llm_alignment_experiments_test_dilemma_id_dilemmas_dilemma_id_f"
		}),
]);

export const verificationTokens = pgTable("verificationTokens", {
	identifier: varchar().notNull(),
	token: varchar().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationTokens_identifier_token_pk"}),
]);

export const accounts = pgTable("accounts", {
	userId: varchar().notNull(),
	type: varchar().notNull(),
	provider: varchar().notNull(),
	providerAccountId: varchar().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: varchar("token_type"),
	scope: varchar(),
	idToken: text("id_token"),
	sessionState: varchar("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_userId_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "accounts_provider_providerAccountId_pk"}),
]);
