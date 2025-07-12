-- Rollback script to migration 0004_public_magik.sql
-- This preserves data in unaffected tables while removing newer schema changes

-- IMPORTANT: Run this in a transaction and test on a backup first!
BEGIN;

-- Step 1: Drop functions added in 0006_add_cleanup_procedures.sql
DROP FUNCTION IF EXISTS cleanup_stale_sessions();
DROP FUNCTION IF EXISTS cleanup_expired_auth_sessions();
DROP FUNCTION IF EXISTS get_db_performance_metrics();
DROP FUNCTION IF EXISTS analyze_table_performance(text);
DROP FUNCTION IF EXISTS validate_referential_integrity();

-- Step 2: Drop tables from 0006_alignment_experiments.sql (in reverse order of creation)
DROP TABLE IF EXISTS experiment_human_validation CASCADE;
DROP TABLE IF EXISTS experiment_consistency_analysis CASCADE;
DROP TABLE IF EXISTS experiment_llm_responses CASCADE;
DROP TABLE IF EXISTS experiment_test_scenarios CASCADE;
DROP TABLE IF EXISTS alignment_experiment_batches CASCADE;

-- Step 3: Drop system_logs table from 0006_add_cleanup_procedures.sql
DROP TABLE IF EXISTS system_logs CASCADE;

-- Step 4: Drop indexes and constraints from 0005_add_performance_indexes.sql
-- Drop check constraints
ALTER TABLE "user_responses" DROP CONSTRAINT IF EXISTS "check_chosen_option";
ALTER TABLE "user_responses" DROP CONSTRAINT IF EXISTS "check_perceived_difficulty";
ALTER TABLE "dilemmas" DROP CONSTRAINT IF EXISTS "check_difficulty_range";

-- Drop unique constraint
ALTER TABLE "user_responses" DROP CONSTRAINT IF EXISTS "unique_session_dilemma";

-- Drop indexes
DROP INDEX IF EXISTS "idx_dilemmas_domain";
DROP INDEX IF EXISTS "idx_dilemmas_difficulty";
DROP INDEX IF EXISTS "idx_dilemmas_created_at";
DROP INDEX IF EXISTS "idx_user_responses_session_id";
DROP INDEX IF EXISTS "idx_user_responses_dilemma_id";
DROP INDEX IF EXISTS "idx_user_responses_created_at";
DROP INDEX IF EXISTS "idx_user_responses_session_dilemma";
DROP INDEX IF EXISTS "idx_llm_responses_dilemma_id";
DROP INDEX IF EXISTS "idx_llm_responses_model_name";
DROP INDEX IF EXISTS "idx_alignment_experiments_human_session";
DROP INDEX IF EXISTS "idx_alignment_experiments_model_name";
DROP INDEX IF EXISTS "idx_alignment_experiments_template_type";
DROP INDEX IF EXISTS "idx_dilemmas_domain_difficulty";
DROP INDEX IF EXISTS "idx_user_responses_session_created";
DROP INDEX IF EXISTS "idx_accounts_user_id";
DROP INDEX IF EXISTS "idx_sessions_user_id";
DROP INDEX IF EXISTS "idx_sessions_expires";
DROP INDEX IF EXISTS "idx_user_responses_old_sessions";
DROP INDEX IF EXISTS "idx_sessions_expired";

-- Step 5: Handle data preservation for user_demographics columns
-- Create backup of data if needed
CREATE TEMP TABLE user_demographics_backup AS 
SELECT 
    id,
    session_id,
    professional_context,
    geographic_region,
    primary_language
FROM user_demographics
WHERE professional_context IS NOT NULL 
   OR geographic_region IS NOT NULL 
   OR primary_language IS NOT NULL;

-- Drop columns from user_demographics (from 0005_right_marauders.sql)
ALTER TABLE "user_demographics" DROP COLUMN IF EXISTS "professional_context";
ALTER TABLE "user_demographics" DROP COLUMN IF EXISTS "geographic_region";
ALTER TABLE "user_demographics" DROP COLUMN IF EXISTS "primary_language";

-- Step 6: Drop llm_alignment_experiments table from 0005_right_marauders.sql
DROP TABLE IF EXISTS "llm_alignment_experiments" CASCADE;

-- Step 7: Update drizzle meta to reflect rollback state
-- This would need to be done through Drizzle's tools

-- Verify the rollback
DO $$
BEGIN
    -- Check if all new tables are dropped
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'llm_alignment_experiments',
            'alignment_experiment_batches',
            'experiment_test_scenarios',
            'experiment_llm_responses',
            'experiment_consistency_analysis',
            'experiment_human_validation',
            'system_logs'
        )
    ) THEN
        RAISE EXCEPTION 'Rollback failed: Some tables still exist';
    END IF;
    
    -- Check if columns are dropped
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'user_demographics'
        AND column_name IN ('professional_context', 'geographic_region', 'primary_language')
    ) THEN
        RAISE EXCEPTION 'Rollback failed: user_demographics columns still exist';
    END IF;
    
    RAISE NOTICE 'Rollback verification passed';
END
$$;

-- If you need to restore the backed up data later:
-- INSERT INTO some_other_table SELECT * FROM user_demographics_backup;

COMMIT;

-- Display backup data count
SELECT COUNT(*) as backed_up_records FROM user_demographics_backup;