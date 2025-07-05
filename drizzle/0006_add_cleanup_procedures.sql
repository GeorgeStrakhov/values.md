-- Migration: Add cleanup procedures and functions
-- Priority: HIGH - Data maintenance for Tier 1 completion

-- Function to cleanup stale sessions (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete user responses from sessions older than 30 days
    WITH stale_sessions AS (
        SELECT DISTINCT session_id 
        FROM user_responses 
        WHERE created_at < NOW() - INTERVAL '30 days'
    )
    DELETE FROM user_responses 
    WHERE session_id IN (SELECT session_id FROM stale_sessions);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also cleanup corresponding demographics data
    DELETE FROM user_demographics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Log the cleanup
    INSERT INTO system_logs (log_level, message, details, created_at)
    VALUES ('INFO', 'Stale session cleanup completed', 
            json_build_object('deleted_responses', deleted_count), 
            NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired auth sessions
CREATE OR REPLACE FUNCTION cleanup_expired_auth_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create system logs table for audit trail
CREATE TABLE IF NOT EXISTS system_logs (
    log_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    log_level varchar(10) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message text NOT NULL,
    details jsonb,
    created_at timestamp DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_system_logs_level_created" ON "system_logs" ("log_level", "created_at");
CREATE INDEX IF NOT EXISTS "idx_system_logs_created_at" ON "system_logs" ("created_at");

-- Function to get database performance metrics
CREATE OR REPLACE FUNCTION get_db_performance_metrics()
RETURNS jsonb AS $$
BEGIN
    RETURN jsonb_build_object(
        'table_sizes', (
            SELECT jsonb_object_agg(schemaname||'.'||tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)))
            FROM pg_tables 
            WHERE schemaname = 'public'
        ),
        'query_stats', (
            SELECT jsonb_build_object(
                'avg_exec_time', ROUND(mean_exec_time::numeric, 2),
                'total_calls', calls,
                'total_time', ROUND(total_exec_time::numeric, 2)
            )
            FROM pg_stat_statements 
            ORDER BY mean_exec_time DESC 
            LIMIT 1
        ),
        'index_usage', (
            SELECT jsonb_object_agg(indexname, idx_scan)
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public' AND idx_scan > 0
            ORDER BY idx_scan DESC
            LIMIT 10
        ),
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to analyze query performance for specific tables
CREATE OR REPLACE FUNCTION analyze_table_performance(table_name text)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    -- Ensure the table exists and update statistics
    EXECUTE format('ANALYZE %I', table_name);
    
    -- Return table statistics
    SELECT jsonb_build_object(
        'table_name', table_name,
        'row_count', (SELECT n_tup_ins - n_tup_del FROM pg_stat_user_tables WHERE relname = table_name),
        'table_size', pg_size_pretty(pg_total_relation_size(table_name)),
        'last_vacuum', (SELECT last_vacuum FROM pg_stat_user_tables WHERE relname = table_name),
        'last_analyze', (SELECT last_analyze FROM pg_stat_user_tables WHERE relname = table_name),
        'seq_scans', (SELECT seq_scan FROM pg_stat_user_tables WHERE relname = table_name),
        'index_scans', (SELECT idx_scan FROM pg_stat_user_tables WHERE relname = table_name)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate referential integrity
CREATE OR REPLACE FUNCTION validate_referential_integrity()
RETURNS jsonb AS $$
DECLARE
    orphaned_responses INTEGER;
    orphaned_llm_responses INTEGER;
    orphaned_experiments INTEGER;
    result jsonb;
BEGIN
    -- Check for orphaned user responses
    SELECT COUNT(*) INTO orphaned_responses
    FROM user_responses ur
    WHERE NOT EXISTS (
        SELECT 1 FROM dilemmas d WHERE d.dilemma_id = ur.dilemma_id
    );
    
    -- Check for orphaned LLM responses  
    SELECT COUNT(*) INTO orphaned_llm_responses
    FROM llm_responses lr
    WHERE NOT EXISTS (
        SELECT 1 FROM dilemmas d WHERE d.dilemma_id = lr.dilemma_id
    );
    
    -- Check for orphaned alignment experiments
    SELECT COUNT(*) INTO orphaned_experiments
    FROM llm_alignment_experiments lae
    WHERE NOT EXISTS (
        SELECT 1 FROM dilemmas d WHERE d.dilemma_id = lae.test_dilemma_id
    );
    
    result := jsonb_build_object(
        'orphaned_user_responses', orphaned_responses,
        'orphaned_llm_responses', orphaned_llm_responses,
        'orphaned_experiments', orphaned_experiments,
        'integrity_check_passed', (orphaned_responses = 0 AND orphaned_llm_responses = 0 AND orphaned_experiments = 0),
        'checked_at', NOW()
    );
    
    -- Log any integrity issues
    IF orphaned_responses > 0 OR orphaned_llm_responses > 0 OR orphaned_experiments > 0 THEN
        INSERT INTO system_logs (log_level, message, details)
        VALUES ('WARN', 'Referential integrity issues detected', result);
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_stale_sessions() IS 'Removes user responses and demographics older than 30 days';
COMMENT ON FUNCTION get_db_performance_metrics() IS 'Returns database performance statistics for monitoring';
COMMENT ON FUNCTION validate_referential_integrity() IS 'Checks for orphaned records that violate referential integrity';