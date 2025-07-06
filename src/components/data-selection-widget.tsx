'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ErrorBoundary from '@/components/error-boundary';

interface DataSample {
  sessionId: string;
  responseCount: number;
  difficulty: number;
  motifs: string[];
  domain: string;
  timestamp: string;
  demographics?: {
    ageRange?: string;
    profession?: string;
    culturalBackground?: string;
  };
}

interface DataSelectionConfig {
  difficultyRange: [number, number];
  motifFilter: string[];
  domainFilter: string[];
  burstiness: number; // 0-100, controls randomness/clustering
  sampleSize: number;
  selectedSessions: string[];
  isValid: boolean;
  validationMessages: string[];
}

interface ValidationResult {
  isValid: boolean;
  messages: string[];
  warnings: string[];
  recommendations: string[];
}

export default function DataSelectionWidget({ 
  onConfigChange, 
  availableData = [] 
}: { 
  onConfigChange: (config: DataSelectionConfig) => void;
  availableData: DataSample[];
}) {
  const [config, setConfig] = useState<DataSelectionConfig>({
    difficultyRange: [1, 10],
    motifFilter: [],
    domainFilter: [],
    burstiness: 50,
    sampleSize: 20,
    selectedSessions: [],
    isValid: true,
    validationMessages: []
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<DataSample[]>([]);

  // Extract unique values from available data
  const availableMotifs = Array.from(new Set(
    availableData.flatMap(d => d.motifs)
  )).filter(Boolean);
  
  const availableDomains = Array.from(new Set(
    availableData.map(d => d.domain)
  )).filter(Boolean);

  // Validation function
  const validateSelection = (filtered: DataSample[]): ValidationResult => {
    const messages: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    if (filtered.length === 0) {
      messages.push('No data matches current filters');
      recommendations.push('Try expanding difficulty range or removing motif filters');
      return { isValid: false, messages, warnings, recommendations };
    }
    
    if (filtered.length < 10) {
      warnings.push(`Only ${filtered.length} sessions selected - may affect result reliability`);
      recommendations.push('Consider relaxing filters for more robust results');
    }
    
    const totalResponses = filtered.reduce((sum, d) => sum + d.responseCount, 0);
    if (totalResponses < 30) {
      warnings.push(`Only ${totalResponses} total responses - minimum 30 recommended`);
    }
    
    const uniqueMotifs = Array.from(new Set(filtered.flatMap(d => d.motifs)));
    if (uniqueMotifs.length < 3) {
      warnings.push(`Only ${uniqueMotifs.length} motifs represented - diversity may be limited`);
      recommendations.push('Include more motif types for balanced analysis');
    }
    
    if (config.burstiness > 80) {
      warnings.push('High clustering may reduce response diversity');
      recommendations.push('Consider lower burstiness (50-70%) for more varied data');
    }
    
    return { 
      isValid: filtered.length > 0, 
      messages, 
      warnings, 
      recommendations 
    };
  };

  // Calculate filtered data and validation
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      let filtered = availableData.filter(sample => {
        const inDifficultyRange = sample.difficulty >= config.difficultyRange[0] && 
                                 sample.difficulty <= config.difficultyRange[1];
        
        const hasMatchingMotif = config.motifFilter.length === 0 || 
                                config.motifFilter.some(m => sample.motifs.includes(m));
        
        const hasMatchingDomain = config.domainFilter.length === 0 || 
                                 config.domainFilter.includes(sample.domain);
        
        return inDifficultyRange && hasMatchingMotif && hasMatchingDomain;
      });

      // Validate selection before applying sampling
      const validation = validateSelection(filtered);

      // Apply burstiness - higher values create more clustering/less randomness
      if (config.burstiness > 50) {
        // Cluster by similar characteristics
        filtered = filtered.sort((a, b) => {
          const aSimilarity = a.motifs.filter(m => config.motifFilter.includes(m)).length;
          const bSimilarity = b.motifs.filter(m => config.motifFilter.includes(m)).length;
          return bSimilarity - aSimilarity;
        });
      } else if (config.burstiness < 50) {
        // Add more randomness
        filtered = filtered.sort(() => Math.random() - 0.5);
      }

      // Take sample size
      const sampled = filtered.slice(0, config.sampleSize);
      setPreviewData(sampled);
      
      // Update config with validation results
      const newConfig = {
        ...config,
        selectedSessions: sampled.map(d => d.sessionId),
        isValid: validation.isValid,
        validationMessages: [...validation.messages, ...validation.warnings, ...validation.recommendations]
      };
      
      setConfig(newConfig);
      onConfigChange(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Selection processing failed');
    } finally {
      setIsLoading(false);
    }
  }, [config.difficultyRange, config.motifFilter, config.domainFilter, config.burstiness, config.sampleSize, availableData]);

  const updateConfig = (updates: Partial<DataSelectionConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleMotifFilter = (motif: string) => {
    const newFilter = config.motifFilter.includes(motif)
      ? config.motifFilter.filter(m => m !== motif)
      : [...config.motifFilter, motif];
    updateConfig({ motifFilter: newFilter });
  };

  const toggleDomainFilter = (domain: string) => {
    const newFilter = config.domainFilter.includes(domain)
      ? config.domainFilter.filter(d => d !== domain)
      : [...config.domainFilter, domain];
    updateConfig({ domainFilter: newFilter });
  };

  // Create difficulty histogram data
  const difficultyHistogram = Array.from({ length: 10 }, (_, i) => {
    const difficulty = i + 1;
    const count = previewData.filter(d => Math.floor(d.difficulty) === difficulty).length;
    const inRange = difficulty >= config.difficultyRange[0] && difficulty <= config.difficultyRange[1];
    return { difficulty, count, inRange };
  });

  // Create motif distribution
  const motifDistribution = availableMotifs.map(motif => {
    const count = previewData.filter(d => d.motifs.includes(motif)).length;
    const selected = config.motifFilter.includes(motif);
    return { motif, count, selected };
  });

  // Smart defaults
  const applySmartDefaults = () => {
    updateConfig({
      difficultyRange: [3, 8], // Focus on moderate to high difficulty
      motifFilter: [], // Include all motifs for diversity
      domainFilter: [], // Include all domains
      burstiness: 60, // Slight clustering for coherence
      sampleSize: Math.min(availableData.length, 15) // Use most available data
    });
  };

  const resetToBasic = () => {
    updateConfig({
      difficultyRange: [1, 10],
      motifFilter: [],
      domainFilter: [],
      burstiness: 50,
      sampleSize: 20
    });
    setShowAdvanced(false);
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="text-red-800 font-medium">Data Selection Error</div>
          <div className="text-red-700 text-sm mt-1">{error}</div>
          <Button onClick={() => setError(null)} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const DataSelectionFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="text-red-800 font-medium">Data Selection Error</div>
        <div className="text-red-700 text-sm mt-1">Failed to load data selection controls</div>
        <Button onClick={retry} variant="outline" size="sm" className="mt-2">
          🔄 Retry
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🎯 Data Selection & Sampling</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure which data to include in experiments using real user responses
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={applySmartDefaults}
                disabled={isLoading}
              >
                Smart Defaults
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Validation Status */}
          {config.validationMessages.length > 0 && (
            <div className={`p-3 rounded-lg ${config.isValid ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-medium text-sm ${config.isValid ? 'text-yellow-800' : 'text-red-800'}`}>
                {config.isValid ? '⚠️ Selection Warnings' : '❌ Selection Issues'}
              </div>
              <ul className={`text-sm mt-1 space-y-1 ${config.isValid ? 'text-yellow-700' : 'text-red-700'}`}>
                {config.validationMessages.map((msg, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-xs mt-0.5">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Processing selection...
            </div>
          )}
        
        {/* Difficulty Range Selector with Histogram */}
        <div>
          <h3 className="font-semibold mb-3">Difficulty Range</h3>
          <div className="flex items-end gap-1 mb-3 h-20">
            {difficultyHistogram.map(({ difficulty, count, inRange }) => (
              <div key={difficulty} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${inRange ? 'bg-blue-500' : 'bg-gray-300'} transition-colors`}
                  style={{ height: `${Math.max(4, (count / Math.max(...difficultyHistogram.map(h => h.count))) * 60)}px` }}
                />
                <span className="text-xs mt-1">{difficulty}</span>
              </div>
            ))}
          </div>
          <Slider
            value={config.difficultyRange}
            onValueChange={(value) => updateConfig({ difficultyRange: value as [number, number] })}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Easy (1)</span>
            <span>Range: {config.difficultyRange[0]} - {config.difficultyRange[1]}</span>
            <span>Hard (10)</span>
          </div>
        </div>

        {/* Basic Filters (Always Visible) */}
        <div className="space-y-4">
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateConfig({ difficultyRange: [6, 10] })}
            >
              High Difficulty Only
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateConfig({ motifFilter: ['NUMBERS_FIRST', 'PERSON_FIRST'] })}
            >
              Key Motifs
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetToBasic}
            >
              Reset
            </Button>
          </div>

          {/* Sample Size (Always visible) */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Sample Size</span>
              <span className="text-sm font-mono">{config.sampleSize} sessions</span>
            </div>
            <Slider
              value={[config.sampleSize]}
              onValueChange={(value) => updateConfig({ sampleSize: value[0] })}
              min={3}
              max={Math.min(50, availableData.length)}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Controls (Collapsible) */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            
            {/* Motif Filter */}
            <div>
              <h3 className="font-semibold mb-3">Ethical Motif Selection</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {motifDistribution.map(({ motif, count, selected }) => (
                  <div key={motif} className="flex items-center justify-between">
                    <Button
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMotifFilter(motif)}
                      className="flex-1 justify-between"
                    >
                      <span className="text-xs">{motif.replace('_', ' ')}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {count}
                      </Badge>
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {config.motifFilter.length === 0 ? 'All motifs included' : `${config.motifFilter.length} motifs selected`}
              </p>
            </div>

            {/* Domain Filter */}
            <div>
              <h3 className="font-semibold mb-3">Domain Selection</h3>
              <div className="flex flex-wrap gap-2">
                {availableDomains.map(domain => (
                  <Button
                    key={domain}
                    variant={config.domainFilter.includes(domain) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDomainFilter(domain)}
                  >
                    {domain}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {config.domainFilter.length === 0 ? 'All domains included' : `${config.domainFilter.length} domains selected`}
              </p>
            </div>

            {/* Sampling Strategy */}
            <div>
              <h3 className="font-semibold mb-3">Sampling Strategy</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Clustering vs Randomness</span>
                    <span className="text-sm font-mono">{config.burstiness}%</span>
                  </div>
                  <Slider
                    value={[config.burstiness]}
                    onValueChange={(value) => updateConfig({ burstiness: value[0] })}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>🎲 Random</span>
                    <span>🔗 Clustered</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.burstiness < 30 ? 'Highly randomized - maximum response diversity' :
                     config.burstiness > 70 ? 'Clustered by similarity - coherent patterns' :
                     'Balanced approach - moderate clustering with diversity'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Results */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Selection Preview</h3>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{previewData.length}</div>
                <div className="text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {previewData.reduce((sum, d) => sum + d.responseCount, 0)}
                </div>
                <div className="text-muted-foreground">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(previewData.reduce((sum, d) => sum + d.difficulty, 0) / previewData.length * 10) / 10 || 0}
                </div>
                <div className="text-muted-foreground">Avg Difficulty</div>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}