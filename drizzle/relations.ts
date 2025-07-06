import { relations } from "drizzle-orm/relations";
import { alignmentExperimentBatches, experimentLlmResponses, experimentTestScenarios, dilemmas, users, sessions, userResponses, llmResponses, experimentConsistencyAnalysis, llmAlignmentExperiments, accounts } from "./schema";

export const experimentLlmResponsesRelations = relations(experimentLlmResponses, ({one}) => ({
	alignmentExperimentBatch: one(alignmentExperimentBatches, {
		fields: [experimentLlmResponses.batchId],
		references: [alignmentExperimentBatches.batchId]
	}),
	experimentTestScenario: one(experimentTestScenarios, {
		fields: [experimentLlmResponses.scenarioId],
		references: [experimentTestScenarios.scenarioId]
	}),
}));

export const alignmentExperimentBatchesRelations = relations(alignmentExperimentBatches, ({many}) => ({
	experimentLlmResponses: many(experimentLlmResponses),
	experimentTestScenarios: many(experimentTestScenarios),
	experimentConsistencyAnalyses: many(experimentConsistencyAnalysis),
}));

export const experimentTestScenariosRelations = relations(experimentTestScenarios, ({one, many}) => ({
	experimentLlmResponses: many(experimentLlmResponses),
	alignmentExperimentBatch: one(alignmentExperimentBatches, {
		fields: [experimentTestScenarios.batchId],
		references: [alignmentExperimentBatches.batchId]
	}),
	dilemma: one(dilemmas, {
		fields: [experimentTestScenarios.sourceDilemmaId],
		references: [dilemmas.dilemmaId]
	}),
}));

export const dilemmasRelations = relations(dilemmas, ({many}) => ({
	experimentTestScenarios: many(experimentTestScenarios),
	userResponses: many(userResponses),
	llmResponses: many(llmResponses),
	llmAlignmentExperiments: many(llmAlignmentExperiments),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	accounts: many(accounts),
}));

export const userResponsesRelations = relations(userResponses, ({one}) => ({
	dilemma: one(dilemmas, {
		fields: [userResponses.dilemmaId],
		references: [dilemmas.dilemmaId]
	}),
}));

export const llmResponsesRelations = relations(llmResponses, ({one}) => ({
	dilemma: one(dilemmas, {
		fields: [llmResponses.dilemmaId],
		references: [dilemmas.dilemmaId]
	}),
}));

export const experimentConsistencyAnalysisRelations = relations(experimentConsistencyAnalysis, ({one}) => ({
	alignmentExperimentBatch: one(alignmentExperimentBatches, {
		fields: [experimentConsistencyAnalysis.batchId],
		references: [alignmentExperimentBatches.batchId]
	}),
}));

export const llmAlignmentExperimentsRelations = relations(llmAlignmentExperiments, ({one}) => ({
	dilemma: one(dilemmas, {
		fields: [llmAlignmentExperiments.testDilemmaId],
		references: [dilemmas.dilemmaId]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));