import { pgTable, varchar, text, numeric, boolean, timestamp, uuid, integer, foreignKey, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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

export const userDemographics = pgTable("user_demographics", {
	sessionId: varchar("session_id").primaryKey().notNull(),
	ageRange: varchar("age_range"),
	educationLevel: varchar("education_level"),
	culturalBackground: varchar("cultural_background"),
	profession: varchar(),
	consentResearch: boolean("consent_research").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

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
