# Data Pipeline Architecture

## 🌊 Flow Overview

```
CSV Files → Database → User Interface → Responses → AI Analysis → Values.md
    ↓           ↓            ↓           ↓            ↓            ↓
Frameworks   Schema    Dilemma UI   localStorage   OpenRouter   Download
Motifs      Tables    Navigation   + Database    API Call    File Export
Dilemmas    Seeded    Progress     Persistence   Analysis    User Profile
```

## 📁 Data Sources

### 1. **CSV Files** (`striated/`)
**Single source of truth for ethical frameworks and motifs**

#### `frameworks.csv`
```csv
name,description,category,keyPrinciples,keywords
Utilitarianism,Greatest good for greatest number,Consequentialist,Maximize happiness;Minimize suffering,utility,happiness,welfare
Deontology,Duty-based ethics,Rule-based,Categorical imperative;Moral duties,duty,rules,kant
Virtue Ethics,Character-based morality,Character,Excellence of character;Practical wisdom,virtue,character,aristotle
```

#### `motifs.csv`
```csv
name,description,category,frameworks,choiceIndicators
Harm Prevention,Avoiding physical/emotional damage,Protection,Utilitarianism;Deontology,safety first;minimize risk
Justice,Fair treatment and rights,Fairness,Deontology;Rights Theory,equal treatment;fairness
Autonomy,Respect for individual choice,Individual Rights,Deontology;Libertarianism,personal freedom;self-determination
```

#### `dilemmas.csv`
```csv
title,scenario,choiceA,choiceB,choiceC,choiceD,domain,difficulty
Autonomous Vehicle,Self-driving car must choose...,Save passengers,Save pedestrians,Minimize total harm,Random choice,Technology,8
```

### 2. **Database Tables** (PostgreSQL)

#### Schema Relationships
```sql
frameworks ──┐
             ├─→ motifs ──→ choice_mappings ──→ user_responses ──→ values_generation
dilemmas ────┘
```

#### Key Tables
- **`frameworks`**: Ethical theories with principles and keywords
- **`motifs`**: Value indicators mapped to framework connections
- **`dilemmas`**: Generated scenarios with UUID routing
- **`userResponses`**: User choices with reasoning and difficulty ratings
- **`llmResponses`**: Baseline AI responses for comparison

## 🔄 Synchronization Process

### Data Sync Manager (`scripts/data-sync.ts`)

#### Phase 1: Validation
```typescript
validateCsvFiles()
├── Check file existence
├── Validate column structure  
├── Verify data integrity
└── Count records per file
```

#### Phase 2: Schema Verification
```typescript
validateDatabaseSchema()
├── Confirm table existence
├── Check foreign key relationships
└── Validate migration status
```

#### Phase 3: Intelligent Updates
```typescript
syncCsvToDatabase()
├── Compare CSV vs Database content
├── Update only changed records
├── Preserve user-generated data
└── Log all modifications
```

#### Phase 4: Relationship Validation
```typescript
validateDataRelationships()
├── Verify motif → framework connections
├── Check dilemma → choice mappings
└── Validate data consistency
```

## 🎯 User Journey Data Flow

### 1. **Dilemma Loading**
```typescript
// API: /api/dilemmas/random
Database.dilemmas.findRandom() → UUID → /explore/[uuid]
├── Load dilemma from database
├── Initialize store state
└── Render UI with choices
```

### 2. **Response Capture**
```typescript
// Store: dilemma-store.ts
User Selection → Zustand Store → localStorage backup
├── selectedOption: 'a' | 'b' | 'c' | 'd'
├── reasoning: string
├── perceivedDifficulty: 1-10
└── responseTime: milliseconds
```

### 3. **Navigation & Progress**
```typescript
// FIXED: Simple navigation system
goToNext() → saveResponse() → updateIndex() → newURL
├── Save current response to store
├── Increment currentIndex  
├── Update progress indicator (1→2→3...)
└── Navigate to next dilemma UUID
```

### 4. **Response Persistence**
```typescript
// Final submission: /api/responses
localStorage responses → Database batch insert
├── sessionId: unique identifier
├── responses: Response[]
└── timestamp: completion time
```

### 5. **Values Generation**
```typescript
// API: /api/generate-values
Database responses → Motif mapping → AI prompt → values.md
├── Fetch user responses by sessionId
├── Map choices to motifs (CSV-based)
├── Build ethical framework context
├── Generate AI prompt with context
├── Call OpenRouter API (Claude 3.5 Sonnet)
└── Return formatted values.md file
```

## 🧮 Motif Mapping Algorithm

### Choice → Motif Analysis
```typescript
// Example mapping logic
function mapChoiceToMotifs(dilemmaId: string, choice: string): Motif[] {
  const choicePatterns = {
    'a': ['harm_prevention', 'safety_first'],
    'b': ['autonomy', 'individual_rights'], 
    'c': ['justice', 'fairness'],
    'd': ['utility', 'greater_good']
  };
  
  return getMotifsByIndicators(choicePatterns[choice]);
}
```

### Framework Weight Calculation
```typescript
// Aggregate user's motif choices
function calculateFrameworkWeights(responses: Response[]): FrameworkWeights {
  const motifCounts = responses.flatMap(r => mapChoiceToMotifs(r.dilemmaId, r.choice));
  const frameworkWeights = {};
  
  motifCounts.forEach(motif => {
    motif.frameworks.forEach(framework => {
      frameworkWeights[framework] = (frameworkWeights[framework] || 0) + 1;
    });
  });
  
  return normalizeWeights(frameworkWeights);
}
```

## 🤖 AI Values Generation

### Prompt Construction
```typescript
const prompt = `
Based on the user's responses to ethical dilemmas, generate a values.md profile:

User Choices Summary:
${responses.map(r => `${r.dilemmaId}: Choice ${r.choice} - ${r.reasoning}`).join('\n')}

Detected Motifs:
${detectedMotifs.map(m => `- ${m.name}: ${m.description}`).join('\n')}

Framework Weights:
${Object.entries(frameworkWeights).map(([f, w]) => `- ${f}: ${w}%`).join('\n')}

Generate a values.md file that captures their ethical profile...
`;
```

### Template System
```typescript
// src/lib/values-templates.ts
interface ValueTemplate {
  name: string;
  format: 'default' | 'computational' | 'narrative' | 'minimal';
  sections: TemplateSection[];
}

// A/B testing different template formats
const templates = {
  default: defaultTemplate,
  computational: computationalTemplate,
  narrative: narrativeTemplate
};
```

## 📊 Experiment Management

### A/B Testing Infrastructure
```typescript
// Admin interface for experiment configuration
interface Experiment {
  name: string;
  template: ValueTemplate;
  userSegment: 'all' | 'returning' | 'new';
  startDate: Date;
  endDate: Date;
  metrics: ExperimentMetric[];
}
```

### Data Collection
- Response patterns by template type
- Completion rates by experiment variant
- User satisfaction scores
- Values.md download rates

## 🔍 Monitoring & Health

### Data Integrity Checks
- **CSV Consistency**: Column validation, data type verification
- **Database Relationships**: Foreign key integrity, orphaned records
- **Motif Mappings**: Framework connection validation
- **Response Completeness**: Missing data detection

### Pipeline Health Metrics
- **Sync Success Rate**: CSV → Database updates
- **Response Save Rate**: localStorage → Database persistence  
- **Generation Success Rate**: API → values.md completion
- **Performance**: Response times, error rates

### Alerts & Monitoring
- **Data Drift**: Unexpected changes in user response patterns
- **API Failures**: OpenRouter timeout or error responses
- **Database Issues**: Connection problems, migration failures
- **Performance Degradation**: Slow response times, high error rates

This comprehensive data pipeline ensures reliable, consistent flow from ethical frameworks through user responses to personalized values profiles, with robust synchronization and monitoring at every stage.