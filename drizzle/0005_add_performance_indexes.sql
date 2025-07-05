-- Migration: Add performance indexes and constraints
-- Priority: HIGH - Improves query performance for Tier 1 completion

-- Performance indexes for frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_dilemmas_domain" ON "dilemmas" ("domain");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_dilemmas_difficulty" ON "dilemmas" ("difficulty");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_dilemmas_created_at" ON "dilemmas" ("created_at");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_session_id" ON "user_responses" ("session_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_dilemma_id" ON "user_responses" ("dilemma_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_created_at" ON "user_responses" ("created_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_session_dilemma" ON "user_responses" ("session_id", "dilemma_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_llm_responses_dilemma_id" ON "llm_responses" ("dilemma_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_llm_responses_model_name" ON "llm_responses" ("model_name");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_alignment_experiments_human_session" ON "llm_alignment_experiments" ("human_session_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_alignment_experiments_model_name" ON "llm_alignment_experiments" ("model_name");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_alignment_experiments_template_type" ON "llm_alignment_experiments" ("template_type");

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_dilemmas_domain_difficulty" ON "dilemmas" ("domain", "difficulty");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_session_created" ON "user_responses" ("session_id", "created_at");

-- Add unique constraint to prevent duplicate responses per session/dilemma
ALTER TABLE "user_responses" ADD CONSTRAINT "unique_session_dilemma" UNIQUE ("session_id", "dilemma_id");

-- Add check constraints for data integrity
ALTER TABLE "user_responses" ADD CONSTRAINT "check_chosen_option" CHECK ("chosen_option" IN ('a', 'b', 'c', 'd'));
ALTER TABLE "user_responses" ADD CONSTRAINT "check_perceived_difficulty" CHECK ("perceived_difficulty" >= 1 AND "perceived_difficulty" <= 10);

ALTER TABLE "dilemmas" ADD CONSTRAINT "check_difficulty_range" CHECK ("difficulty" >= 1 AND "difficulty" <= 10);

-- Add foreign key constraint validation (already exists but ensuring)
ALTER TABLE "user_responses" DROP CONSTRAINT IF EXISTS "user_responses_dilemma_id_dilemmas_dilemma_id_fk";
ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_dilemma_id_dilemmas_dilemma_id_fk" 
  FOREIGN KEY ("dilemma_id") REFERENCES "dilemmas"("dilemma_id") ON DELETE CASCADE;

-- Add indexes for Auth.js tables performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accounts_user_id" ON "accounts" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_sessions_user_id" ON "sessions" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_sessions_expires" ON "sessions" ("expires");

-- Add cleanup indexes for old data
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_responses_old_sessions" ON "user_responses" ("created_at") WHERE "created_at" < NOW() - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_sessions_expired" ON "sessions" ("expires") WHERE "expires" < NOW();

COMMENT ON INDEX "idx_dilemmas_domain" IS 'Performance index for dilemma filtering by domain';
COMMENT ON INDEX "idx_user_responses_session_dilemma" IS 'Composite index for session response lookups';
COMMENT ON CONSTRAINT "unique_session_dilemma" ON "user_responses" IS 'Prevents duplicate responses for same session/dilemma pair';