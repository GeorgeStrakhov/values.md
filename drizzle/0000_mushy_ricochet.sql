CREATE TABLE "accounts" (
	"userId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"providerAccountId" varchar NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar,
	"scope" varchar,
	"id_token" text,
	"session_state" varchar,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "dilemmas" (
	"dilemma_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" varchar,
	"generator_type" varchar,
	"difficulty" integer,
	"title" varchar NOT NULL,
	"scenario" text NOT NULL,
	"choice_a" text NOT NULL,
	"choice_a_motif" varchar,
	"choice_b" text NOT NULL,
	"choice_b_motif" varchar,
	"choice_c" text NOT NULL,
	"choice_c_motif" varchar,
	"choice_d" text NOT NULL,
	"choice_d_motif" varchar,
	"target_motifs" text,
	"stakeholders" text,
	"cultural_context" varchar,
	"validation_score" numeric,
	"realism_score" numeric,
	"tension_strength" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "frameworks" (
	"framework_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"tradition" varchar,
	"key_principle" text,
	"decision_method" text,
	"lexical_indicators" text,
	"computational_signature" text,
	"historical_figure" varchar,
	"modern_application" text
);
--> statement-breakpoint
CREATE TABLE "llm_responses" (
	"llm_id" varchar NOT NULL,
	"model_name" varchar NOT NULL,
	"dilemma_id" uuid NOT NULL,
	"chosen_option" varchar NOT NULL,
	"reasoning" text,
	"confidence_score" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "motifs" (
	"motif_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar,
	"subcategory" varchar,
	"description" text,
	"lexical_indicators" text,
	"behavioral_indicators" text,
	"logical_patterns" text,
	"conflicts_with" text,
	"synergies_with" text,
	"weight" numeric,
	"cultural_variance" varchar,
	"cognitive_load" varchar
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_demographics" (
	"session_id" varchar PRIMARY KEY NOT NULL,
	"age_range" varchar,
	"education_level" varchar,
	"cultural_background" varchar,
	"profession" varchar,
	"consent_research" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_responses" (
	"response_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"dilemma_id" uuid NOT NULL,
	"chosen_option" varchar NOT NULL,
	"reasoning" text,
	"response_time" integer,
	"perceived_difficulty" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar NOT NULL,
	"emailVerified" timestamp,
	"image" varchar,
	"role" varchar DEFAULT 'user',
	"password" varchar
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_responses" ADD CONSTRAINT "llm_responses_dilemma_id_dilemmas_dilemma_id_fk" FOREIGN KEY ("dilemma_id") REFERENCES "public"."dilemmas"("dilemma_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_dilemma_id_dilemmas_dilemma_id_fk" FOREIGN KEY ("dilemma_id") REFERENCES "public"."dilemmas"("dilemma_id") ON DELETE no action ON UPDATE no action;