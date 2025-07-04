import { describe, it, expect } from 'vitest';
import { 
  validateResponse, 
  validateResponses, 
  detectSuspiciousPatterns, 
  checkDataIntegrity 
} from '@/lib/validation';

describe('Response Validation', () => {
  const validResponse = {
    dilemmaId: '123e4567-e89b-12d3-a456-426614174000',
    chosenOption: 'a',
    responseTime: 5000,
    perceivedDifficulty: 7,
    reasoning: 'This is valid reasoning'
  };

  describe('Single Response Validation', () => {
    it('should validate correct response', () => {
      const result = validateResponse(validResponse);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBeDefined();
      expect(result.sanitized?.dilemmaId).toBe(validResponse.dilemmaId);
    });

    it('should reject invalid UUID', () => {
      const invalid = { ...validResponse, dilemmaId: 'invalid-uuid' };
      const result = validateResponse(invalid);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('dilemmaId must be a valid UUID');
    });

    it('should reject invalid choice option', () => {
      const invalid = { ...validResponse, chosenOption: 'x' };
      const result = validateResponse(invalid);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('chosenOption must be one of: a, b, c, d');
    });

    it('should reject negative response time', () => {
      const invalid = { ...validResponse, responseTime: -100 };
      const result = validateResponse(invalid);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('responseTime cannot be negative');
    });

    it('should reject invalid difficulty range', () => {
      const invalid = { ...validResponse, perceivedDifficulty: 15 };
      const result = validateResponse(invalid);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('perceivedDifficulty must be between 1 and 10');
    });

    it('should warn about unusually long response time', () => {
      const slow = { ...validResponse, responseTime: 400000 }; // 6+ minutes
      const result = validateResponse(slow);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Response time seems unusually long (>5 minutes)');
    });

    it('should warn about very quick response time', () => {
      const fast = { ...validResponse, responseTime: 500 }; // <1 second
      const result = validateResponse(fast);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Response time seems very quick (<1 second)');
    });

    it('should sanitize response data', () => {
      const messy = {
        ...validResponse,
        responseTime: -100, // Should be corrected to 0
        perceivedDifficulty: 15, // Should be corrected to 10
        reasoning: undefined // Should be corrected to empty string
      };
      
      const result = validateResponse(messy);
      
      expect(result.sanitized?.responseTime).toBe(0);
      expect(result.sanitized?.perceivedDifficulty).toBe(10);
      expect(result.sanitized?.reasoning).toBe('');
    });
  });

  describe('Multiple Response Validation', () => {
    it('should validate array of responses', () => {
      const responses = [
        validResponse,
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174001', chosenOption: 'b' },
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174002', chosenOption: 'c' }
      ];
      
      const result = validateResponses(responses);
      
      expect(result.valid).toHaveLength(3);
      expect(result.invalid).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
    });

    it('should detect duplicate responses', () => {
      const responses = [
        validResponse,
        validResponse, // Duplicate
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174001' }
      ];
      
      const result = validateResponses(responses);
      
      expect(result.valid).toHaveLength(2);
      expect(result.duplicates).toContain(validResponse.dilemmaId);
    });

    it('should separate valid and invalid responses', () => {
      const responses = [
        validResponse,
        { ...validResponse, chosenOption: 'invalid' },
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174001' }
      ];
      
      const result = validateResponses(responses);
      
      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].response.chosenOption).toBe('invalid');
    });

    it('should handle non-array input', () => {
      const result = validateResponses('not an array' as any);
      
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.warnings).toContain('Input is not an array');
    });
  });

  describe('Suspicious Pattern Detection', () => {
    it('should detect same choice pattern', () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a'
      }));
      
      const result = detectSuspiciousPatterns(responses);
      
      expect(result.patterns).toContain('All responses use the same choice option');
      expect(result.riskScore).toBeGreaterThan(30);
    });

    it('should detect very fast responses', () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a',
        responseTime: 1000 // Very fast
      }));
      
      const result = detectSuspiciousPatterns(responses);
      
      expect(result.patterns).toContain('Average response time is very fast');
      expect(result.riskScore).toBeGreaterThan(20);
    });

    it('should detect identical difficulty ratings', () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a',
        perceivedDifficulty: 5
      }));
      
      const result = detectSuspiciousPatterns(responses);
      
      expect(result.patterns).toContain('All responses have identical difficulty rating');
      expect(result.riskScore).toBeGreaterThan(10);
    });

    it('should detect lack of reasoning', () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a',
        reasoning: '' // No reasoning
      }));
      
      const result = detectSuspiciousPatterns(responses);
      
      expect(result.patterns).toContain('Most responses lack reasoning');
      expect(result.riskScore).toBeGreaterThan(5);
    });

    it('should handle empty response array', () => {
      const result = detectSuspiciousPatterns([]);
      
      expect(result.patterns).toHaveLength(0);
      expect(result.riskScore).toBe(0);
    });

    it('should limit risk score to 100', () => {
      // Create responses that trigger multiple patterns
      const responses = Array.from({ length: 20 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a', // Same choice
        responseTime: 500, // Very fast
        perceivedDifficulty: 5, // Same difficulty
        reasoning: '' // No reasoning
      }));
      
      const result = detectSuspiciousPatterns(responses);
      
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Integrity Check', () => {
    it('should provide comprehensive integrity report', () => {
      const responses = [
        validResponse,
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174001' },
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174002', chosenOption: 'invalid' } // Invalid
      ];
      
      const result = checkDataIntegrity(responses as any);
      
      expect(result.totalResponses).toBe(3);
      expect(result.validResponses).toBe(2);
      expect(result.invalidResponses).toBe(1);
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should generate appropriate recommendations', () => {
      const responses = [
        { ...validResponse, dilemmaId: '123e4567-e89b-12d3-a456-426614174003', chosenOption: 'invalid' }, // Invalid
        validResponse,
        validResponse // Duplicate
      ];
      
      const result = checkDataIntegrity(responses as any);
      
      expect(result.recommendations).toContain('Some responses have validation errors and should be reviewed');
      expect(result.recommendations).toContain('Remove duplicate responses to improve data quality');
    });

    it('should recommend improvements for low engagement', () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        ...validResponse,
        dilemmaId: `123e4567-e89b-12d3-a456-42661417400${i}`,
        chosenOption: 'a' as 'a',
        responseTime: 800,
        reasoning: ''
      }));
      
      const result = checkDataIntegrity(responses as any);
      
      expect(result.riskScore).toBeGreaterThan(50);
      expect(result.recommendations).toContain('Response patterns suggest low engagement - consider encouraging more thoughtful responses');
    });
  });
});