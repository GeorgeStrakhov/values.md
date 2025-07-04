-- LLM Alignment Validation Experiments Schema

CREATE TABLE alignment_experiment_batches (
  batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_type VARCHAR NOT NULL, -- 'baseline_vs_aligned', 'consistency_test', 'cross_validation'
  description TEXT,
  llm_providers TEXT[], -- ['openai', 'anthropic', 'google']
  test_scenarios_count INT,
  human_sessions_count INT,
  status VARCHAR DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
  progress_percent INT DEFAULT 0,
  estimated_cost_usd DECIMAL(10,2),
  actual_cost_usd DECIMAL(10,2),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE experiment_test_scenarios (
  scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES alignment_experiment_batches(batch_id),
  source_dilemma_id UUID REFERENCES dilemmas(dilemma_id),
  variation_type VARCHAR, -- 'identical', 'context_shift', 'stakes_change', 'stakeholder_shift'
  scenario_text TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  expected_motifs JSONB, -- what motifs should drive each choice
  difficulty_rating INT,
  domain VARCHAR,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE experiment_llm_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES alignment_experiment_batches(batch_id),
  scenario_id UUID REFERENCES experiment_test_scenarios(scenario_id),
  human_session_id VARCHAR, -- links to original human who generated the VALUES.md
  llm_provider VARCHAR NOT NULL, -- 'openai-gpt4', 'anthropic-claude', 'google-gemini'
  alignment_condition VARCHAR NOT NULL, -- 'baseline' (no values), 'aligned' (with values.md)
  values_document TEXT, -- the VALUES.md content used (null for baseline)
  
  -- LLM Response Data
  chosen_option VARCHAR NOT NULL, -- a, b, c, d
  reasoning TEXT,
  confidence_score INT, -- 1-10 as extracted from response
  response_time_ms INT,
  token_count INT,
  cost_usd DECIMAL(8,4),
  
  -- Analysis Results
  identified_motifs TEXT[], -- motifs we can extract from the reasoning
  consistency_with_values DECIMAL, -- 0-1 score of how well it matches the VALUES.md
  choice_confidence VARCHAR, -- 'high', 'medium', 'low' based on reasoning language
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE experiment_consistency_analysis (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES alignment_experiment_batches(batch_id),
  human_session_id VARCHAR,
  llm_provider VARCHAR,
  
  -- Cross-scenario consistency metrics
  scenario_count INT,
  consistent_choices INT, -- choices that align with predicted motifs
  consistency_percentage DECIMAL,
  
  -- Baseline vs Aligned comparison
  baseline_accuracy DECIMAL, -- how often baseline matched human choices
  aligned_accuracy DECIMAL, -- how often aligned matched human choices
  improvement_delta DECIMAL, -- aligned - baseline
  
  -- Motif coherence analysis
  motif_consistency JSONB, -- per-motif consistency scores
  dominant_motifs TEXT[], -- most frequently used motifs
  conflicting_choices INT, -- scenarios where choice contradicted stated values
  
  statistical_significance DECIMAL, -- p-value for improvement
  sample_size INT,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE experiment_human_validation (
  validation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES alignment_experiment_batches(batch_id),
  scenario_id UUID REFERENCES experiment_test_scenarios(scenario_id),
  human_session_id VARCHAR, -- original VALUES.md author
  
  -- Human validation of LLM choices
  human_choice VARCHAR, -- what the human would choose on this scenario
  human_reasoning TEXT,
  
  -- Rating of LLM performance
  baseline_llm_rating INT, -- 1-10 how well baseline LLM did
  aligned_llm_rating INT, -- 1-10 how well aligned LLM did
  alignment_improvement_rating INT, -- 1-10 how much VALUES.md helped
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_experiment_responses_batch ON experiment_llm_responses(batch_id);
CREATE INDEX idx_experiment_responses_session ON experiment_llm_responses(human_session_id);
CREATE INDEX idx_experiment_responses_provider ON experiment_llm_responses(llm_provider);
CREATE INDEX idx_experiment_consistency_batch ON experiment_consistency_analysis(batch_id);