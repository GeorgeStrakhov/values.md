import { relations } from "drizzle-orm/relations";
import { dilemmas, llmResponses, users, sessions, userResponses, accounts } from "./schema";

export const llmResponsesRelations = relations(llmResponses, ({one}) => ({
	dilemma: one(dilemmas, {
		fields: [llmResponses.dilemmaId],
		references: [dilemmas.dilemmaId]
	}),
}));

export const dilemmasRelations = relations(dilemmas, ({many}) => ({
	llmResponses: many(llmResponses),
	userResponses: many(userResponses),
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

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));