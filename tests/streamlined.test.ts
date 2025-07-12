/**
 * Streamlined Values Generator Tests
 * Focus on core functionality and error handling
 */

import { streamlinedValuesGenerator } from '../src/lib/streamlined-values-generator';

describe('Streamlined Values Generator', () => {
  
  // Test data
  const validResponses = [
    {
      reasoning: "I believe we should focus on the outcome that creates the greatest benefit for the most people, even if it requires some individual sacrifice.",
      choice: "A",
      domain: "public_policy"
    },
    {
      reasoning: "Individual rights and human dignity must be protected regardless of the potential consequences to the broader community.",
      choice: "B", 
      domain: "personal_ethics"
    },
    {
      reasoning: "The most important thing is maintaining the relationships and trust we have with the people closest to us.",
      choice: "C",
      domain: "personal_relationships"
    }
  ];

  describe('Core Functionality', () => {
    
    it('should generate profile with valid responses', async () => {
      const profile = await streamlinedValuesGenerator.generateProfile(validResponses);
      
      expect(profile).toBeDefined();
      expect(profile.valuesMarkdown).toContain('# My Ethical Values');
      expect(profile.summary.primaryApproach).toBeTruthy();
      expect(profile.summary.confidence).toBeGreaterThan(0);
      expect(profile.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should identify utilitarian reasoning', async () => {
      const utilResponses = [{
        reasoning: "We should maximize benefits for the greatest number of people and focus on overall welfare and outcomes.",
        choice: "A",
        domain: "ethics"
      }];
      
      const profile = await streamlinedValuesGenerator.generateProfile(utilResponses);
      
      expect(profile.tactics.some(t => t.name === 'utilitarian')).toBe(true);
      expect(profile.summary.primaryApproach).toContain('Utilitarian');
    });

    it('should identify rights-based reasoning', async () => {
      const rightsResponses = [{
        reasoning: "Individual rights and human dignity must be respected. Every person deserves autonomy and freedom.",
        choice: "B",
        domain: "ethics"
      }];
      
      const profile = await streamlinedValuesGenerator.generateProfile(rightsResponses);
      
      expect(profile.tactics.some(t => t.name === 'rights')).toBe(true);
      expect(profile.summary.primaryApproach).toContain('Rights');
    });

  });

  describe('Input Validation', () => {
    
    it('should handle empty input', async () => {
      const profile = await streamlinedValuesGenerator.generateProfile([]);
      
      expect(profile.metadata.method).toBe('fallback');
      expect(profile.summary.confidence).toBe(0);
      expect(profile.valuesMarkdown).toContain('Analysis Error');
    });

    it('should handle invalid reasoning', async () => {
      const invalidResponses = [
        { reasoning: "", choice: "A", domain: "test" },
        { reasoning: "x", choice: "B", domain: "test" }
      ];
      
      const profile = await streamlinedValuesGenerator.generateProfile(invalidResponses);
      
      expect(profile.summary.warnings.length).toBeGreaterThan(0);
    });

    it('should sanitize malicious input', async () => {
      const maliciousResponses = [{
        reasoning: "This is <script>alert('xss')</script> a test with \"quotes\" and 'apostrophes'",
        choice: "A",
        domain: "test"
      }];
      
      const profile = await streamlinedValuesGenerator.generateProfile(maliciousResponses);
      
      expect(profile.valuesMarkdown).not.toContain('<script>');
      expect(profile.valuesMarkdown).not.toContain('alert');
    });

  });

  describe('Error Handling', () => {
    
    it('should handle null input gracefully', async () => {
      const profile = await streamlinedValuesGenerator.generateProfile(null as any);
      
      expect(profile.metadata.method).toBe('fallback');
      expect(profile.valuesMarkdown).toContain('Analysis Error');
    });

    it('should handle responses with missing fields', async () => {
      const incompleteResponses = [
        { reasoning: "Valid reasoning text here" }, // Missing choice
        { choice: "A" }, // Missing reasoning
        {} // Empty object
      ];
      
      const profile = await streamlinedValuesGenerator.generateProfile(incompleteResponses as any);
      
      expect(profile).toBeDefined();
      expect(profile.summary.warnings.length).toBeGreaterThan(0);
    });

  });

  describe('Quality Assessment', () => {
    
    it('should assess high quality for good responses', async () => {
      const profile = await streamlinedValuesGenerator.generateProfile(validResponses);
      
      expect(profile.metadata.quality).toBe('high');
      expect(profile.summary.confidence).toBeGreaterThan(50);
    });

    it('should assess low quality for poor responses', async () => {
      const poorResponses = [{
        reasoning: "bad", // Too short
        choice: "A",
        domain: "test"
      }];
      
      const profile = await streamlinedValuesGenerator.generateProfile(poorResponses);
      
      expect(profile.metadata.quality).toBe('low');
    });

  });

  describe('Performance', () => {
    
    it('should complete analysis within reasonable time', async () => {
      const start = Date.now();
      const profile = await streamlinedValuesGenerator.generateProfile(validResponses);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Less than 1 second
      expect(profile.metadata.processingTime).toBeLessThan(1000);
    });

    it('should handle large inputs efficiently', async () => {
      const largeResponses = Array(10).fill(null).map((_, i) => ({
        reasoning: `This is a longer reasoning text for response ${i}. `.repeat(10),
        choice: String.fromCharCode(65 + (i % 4)), // A, B, C, D
        domain: `domain_${i % 3}`
      }));
      
      const start = Date.now();
      const profile = await streamlinedValuesGenerator.generateProfile(largeResponses);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000); // Less than 2 seconds
      expect(profile.tactics.length).toBeGreaterThan(0);
    });

  });

});

describe('Integration Tests', () => {
  
  it('should work with the API format', async () => {
    const apiFormatResponses = [
      {
        reasoning: "I think about consequences and try to maximize overall benefit",
        choice: "A",
        domain: "public_policy",
        difficulty: 7
      }
    ];
    
    const profile = await streamlinedValuesGenerator.generateProfile(apiFormatResponses);
    
    expect(profile.summary.primaryApproach).toBeTruthy();
    expect(profile.valuesMarkdown).toContain('AI Interaction Guidance');
  });

});