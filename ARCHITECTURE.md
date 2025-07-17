# VALUES.MD - Rigorous Architecture

## Core System (30 lines)

```
// Data Layer
DB := PostgreSQL{dilemmas: {id, title, scenario, choiceA, choiceB, choiceC, choiceD, domain}}

// API Layer  
GET /api/dilemmas → DB.random(12)
POST /api/values → LLM.analyze(responses) → values.md

// App Layer
landing() → START button → explore()
explore() → {
  dilemmas := fetch('/api/dilemmas')
  responses := []
  
  for each dilemma in dilemmas:
    display(dilemma)
    choice := await user.select(A|B|C|D)
    reasoning := await user.input(optional)
    difficulty := await user.slider(1-10)
    responses.push({dilemma.id, choice, reasoning, difficulty})
  
  redirect('/results?data=' + base64(responses))
}

results(data) → {
  responses := decode(data)
  values := await fetch('/api/values', {body: responses})
  display(values)
}
```

## State Management
- No global state
- URL params for page transitions
- Local component state only
- No localStorage until optional research opt-in

## Routing
- `/` → landing 
- `/explore` → dilemma flow
- `/results?data=...` → values generation

## Build Strategy
- Static generation for landing/results
- Server-side rendering for explore (data fetching)
- All API routes as serverless functions

## Error Handling
- API errors → retry with exponential backoff
- Missing data → fallback to defaults
- Network errors → graceful degradation

## Testing
- Unit: Each function pure, testable
- Integration: API endpoints with test DB
- E2E: Complete user flow automation