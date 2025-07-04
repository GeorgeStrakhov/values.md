// Data validation and integrity checks for responses

export interface DilemmaResponse {
  dilemmaId: string;
  chosenOption: 'a' | 'b' | 'c' | 'd';
  reasoning?: string;
  responseTime: number;
  perceivedDifficulty: number;
  timestamp?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: DilemmaResponse;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Validate a single response
export function validateResponse(response: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!response || typeof response !== 'object') {
    errors.push('Response must be an object');
    return { isValid: false, errors, warnings };
  }
  
  // Validate dilemmaId
  if (!response.dilemmaId || typeof response.dilemmaId !== 'string') {
    errors.push('dilemmaId is required and must be a string');
  } else if (!UUID_REGEX.test(response.dilemmaId)) {
    errors.push('dilemmaId must be a valid UUID');
  }
  
  // Validate chosenOption
  if (!response.chosenOption || typeof response.chosenOption !== 'string') {
    errors.push('chosenOption is required and must be a string');
  } else if (!['a', 'b', 'c', 'd'].includes(response.chosenOption)) {
    errors.push('chosenOption must be one of: a, b, c, d');
  }
  
  // Validate responseTime
  if (typeof response.responseTime !== 'number') {
    errors.push('responseTime must be a number');
  } else if (response.responseTime < 0) {
    errors.push('responseTime cannot be negative');
  } else if (response.responseTime > 300000) { // 5 minutes
    warnings.push('Response time seems unusually long (>5 minutes)');
  } else if (response.responseTime < 1000) { // 1 second
    warnings.push('Response time seems very quick (<1 second)');
  }
  
  // Validate perceivedDifficulty
  if (typeof response.perceivedDifficulty !== 'number') {
    errors.push('perceivedDifficulty must be a number');
  } else if (response.perceivedDifficulty < 1 || response.perceivedDifficulty > 10) {
    errors.push('perceivedDifficulty must be between 1 and 10');
  }
  
  // Validate reasoning (optional)
  if (response.reasoning !== undefined) {
    if (typeof response.reasoning !== 'string') {
      errors.push('reasoning must be a string if provided');
    } else if (response.reasoning.length > 5000) {
      warnings.push('Reasoning is very long (>5000 characters)');
    }
  }
  
  // Create sanitized version
  const sanitized: DilemmaResponse = {
    dilemmaId: response.dilemmaId,
    chosenOption: response.chosenOption,
    reasoning: response.reasoning || '',
    responseTime: Math.max(0, response.responseTime || 0),
    perceivedDifficulty: Math.min(10, Math.max(1, response.perceivedDifficulty || 5)),
    timestamp: response.timestamp || Date.now()
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized
  };
}

// Validate array of responses
export function validateResponses(responses: any[]): {
  valid: DilemmaResponse[];
  invalid: any[];
  warnings: string[];
  duplicates: string[];
} {
  if (!Array.isArray(responses)) {
    return {
      valid: [],
      invalid: [responses],
      warnings: ['Input is not an array'],
      duplicates: []
    };
  }
  
  const valid: DilemmaResponse[] = [];
  const invalid: any[] = [];
  const allWarnings: string[] = [];
  const seenDilemmaIds = new Set<string>();
  const duplicates: string[] = [];
  
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const validation = validateResponse(response);
    
    if (validation.isValid && validation.sanitized) {
      // Check for duplicates
      if (seenDilemmaIds.has(validation.sanitized.dilemmaId)) {
        duplicates.push(validation.sanitized.dilemmaId);
        allWarnings.push(`Duplicate response for dilemma ${validation.sanitized.dilemmaId}`);
      } else {
        seenDilemmaIds.add(validation.sanitized.dilemmaId);
        valid.push(validation.sanitized);
      }
    } else {
      invalid.push({ index: i, response, errors: validation.errors });
    }
    
    allWarnings.push(...validation.warnings);
  }
  
  return {
    valid,
    invalid,
    warnings: allWarnings,
    duplicates
  };
}

// Detect suspicious patterns in responses
export function detectSuspiciousPatterns(responses: DilemmaResponse[]): {
  patterns: string[];
  riskScore: number; // 0-100
} {
  const patterns: string[] = [];
  let riskScore = 0;
  
  if (responses.length === 0) {
    return { patterns, riskScore };
  }
  
  // Check for same choice pattern
  const choices = responses.map(r => r.chosenOption);
  const uniqueChoices = new Set(choices);
  
  if (uniqueChoices.size === 1) {
    patterns.push('All responses use the same choice option');
    riskScore += 40;
  } else if (uniqueChoices.size === 2 && responses.length > 5) {
    patterns.push('Very limited choice variety');
    riskScore += 20;
  }
  
  // Check for suspiciously fast responses
  const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
  const fastResponses = responses.filter(r => r.responseTime < 2000).length;
  
  if (avgResponseTime < 3000) {
    patterns.push('Average response time is very fast');
    riskScore += 25;
  }
  
  if (fastResponses / responses.length > 0.5) {
    patterns.push('More than half of responses are very quick (<2 seconds)');
    riskScore += 30;
  }
  
  // Check for identical difficulty ratings
  const difficulties = responses.map(r => r.perceivedDifficulty);
  const uniqueDifficulties = new Set(difficulties);
  
  if (uniqueDifficulties.size === 1 && responses.length > 3) {
    patterns.push('All responses have identical difficulty rating');
    riskScore += 15;
  }
  
  // Check for empty reasoning
  const emptyReasoning = responses.filter(r => !r.reasoning || r.reasoning.trim().length === 0).length;
  if (emptyReasoning / responses.length > 0.8) {
    patterns.push('Most responses lack reasoning');
    riskScore += 10;
  }
  
  return {
    patterns,
    riskScore: Math.min(100, riskScore)
  };
}

// Comprehensive data integrity check
export function checkDataIntegrity(responses: DilemmaResponse[]) {
  const validation = validateResponses(responses);
  const suspiciousPatterns = detectSuspiciousPatterns(validation.valid);
  
  return {
    totalResponses: responses.length,
    validResponses: validation.valid.length,
    invalidResponses: validation.invalid.length,
    duplicates: validation.duplicates.length,
    warnings: validation.warnings,
    suspiciousPatterns: suspiciousPatterns.patterns,
    riskScore: suspiciousPatterns.riskScore,
    qualityScore: Math.max(0, 100 - suspiciousPatterns.riskScore),
    recommendations: generateRecommendations(validation, suspiciousPatterns)
  };
}

function generateRecommendations(
  validation: ReturnType<typeof validateResponses>,
  suspicious: ReturnType<typeof detectSuspiciousPatterns>
): string[] {
  const recommendations: string[] = [];
  
  if (validation.invalid.length > 0) {
    recommendations.push('Some responses have validation errors and should be reviewed');
  }
  
  if (validation.duplicates.length > 0) {
    recommendations.push('Remove duplicate responses to improve data quality');
  }
  
  if (suspicious.riskScore > 50) {
    recommendations.push('Response patterns suggest low engagement - consider encouraging more thoughtful responses');
  }
  
  if (suspicious.patterns.some(p => p.includes('fast'))) {
    recommendations.push('Consider adding minimum response time requirements');
  }
  
  if (suspicious.patterns.some(p => p.includes('reasoning'))) {
    recommendations.push('Encourage users to provide reasoning for better values analysis');
  }
  
  return recommendations;
}