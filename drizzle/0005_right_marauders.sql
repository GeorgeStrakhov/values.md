CREATE TABLE "llm_alignment_experiments" (
	"experiment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"human_session_id" varchar NOT NULL,
	"template_type" varchar NOT NULL,
	"model_name" varchar NOT NULL,
	"values_document" text NOT NULL,
	"test_dilemma_id" uuid NOT NULL,
	"human_choice" varchar NOT NULL,
	"llm_choice" varchar NOT NULL,
	"llm_reasoning" text,
	"alignment_score" numeric,
	"confidence_score" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_demographics" ADD COLUMN "professional_context" varchar;--> statement-breakpoint
ALTER TABLE "user_demographics" ADD COLUMN "geographic_region" varchar;--> statement-breakpoint
ALTER TABLE "user_demographics" ADD COLUMN "primary_language" varchar;--> statement-breakpoint
ALTER TABLE "llm_alignment_experiments" ADD CONSTRAINT "llm_alignment_experiments_test_dilemma_id_dilemmas_dilemma_id_fk" FOREIGN KEY ("test_dilemma_id") REFERENCES "public"."dilemmas"("dilemma_id") ON DELETE no action ON UPDATE no action;