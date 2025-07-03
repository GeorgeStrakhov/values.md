'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Multi-dimensional pattern space
interface PatternProfile {
  epistemologic: {
    EMPIRICAL_DEMAND: number;
    AUTHORITY_DEFER: number;
    EXPERIENTIAL_TRUST: number;
    INTUITIVE_LEAP: number;
    SKEPTICAL_DEFAULT: number;
  };
  axiologic: {
    TRANSCENDENT_SOURCE: number;
    IMMANENT_CREATION: number;
    TELEOLOGICAL_ARC: number;
    COMMUNAL_BELONGING: number;
    AESTHETIC_APPRECIATION: number;
  };
  anthropologic: {
    AUTONOMOUS_AGENT: number;
    RELATIONAL_NODE: number;
    CULTURAL_CARRIER: number;
    EVOLVED_ANIMAL: number;
    SPIRITUAL_BEING: number;
  };
  economic: {
    ZERO_SUM_WORLD: number;
    POSITIVE_SUM_CREATION: number;
    MARKET_OPTIMIZATION: number;
    GIFT_ECONOMY: number;
    ABUNDANCE_MINDSET: number;
  };
  narrative: {
    LINEAR_PROGRESS: number;
    CYCLICAL_RETURN: number;
    HEROIC_JOURNEY: number;
    COLLECTIVE_SAGA: number;
    RANDOM_CHAOS: number;
  };
  aesthetic: {
    CLASSICAL_HARMONY: number;
    ROMANTIC_SUBLIME: number;
    MINIMALIST_PURITY: number;
    AUTHENTIC_EXPRESSION: number;
    ORGANIC_NATURALISM: number;
  };
  ontologic: {
    MATERIALIST_BASE: number;
    IDEALIST_MIND: number;
    DETERMINIST_CAUSATION: number;
    LIBERTARIAN_CHOICE: number;
    PROCESS_BECOMING: number;
  };
}

// Sample pattern profiles representing different human types
const PATTERN_ARCHETYPES: Record<string, PatternProfile> = {
  scientific_rationalist: {
    epistemologic: { EMPIRICAL_DEMAND: 90, AUTHORITY_DEFER: 40, EXPERIENTIAL_TRUST: 30, INTUITIVE_LEAP: 20, SKEPTICAL_DEFAULT: 80 },
    axiologic: { TRANSCENDENT_SOURCE: 20, IMMANENT_CREATION: 80, TELEOLOGICAL_ARC: 70, COMMUNAL_BELONGING: 40, AESTHETIC_APPRECIATION: 50 },
    anthropologic: { AUTONOMOUS_AGENT: 70, RELATIONAL_NODE: 30, CULTURAL_CARRIER: 20, EVOLVED_ANIMAL: 80, SPIRITUAL_BEING: 10 },
    economic: { ZERO_SUM_WORLD: 30, POSITIVE_SUM_CREATION: 80, MARKET_OPTIMIZATION: 60, GIFT_ECONOMY: 20, ABUNDANCE_MINDSET: 70 },
    narrative: { LINEAR_PROGRESS: 80, CYCLICAL_RETURN: 20, HEROIC_JOURNEY: 60, COLLECTIVE_SAGA: 40, RANDOM_CHAOS: 30 },
    aesthetic: { CLASSICAL_HARMONY: 70, ROMANTIC_SUBLIME: 30, MINIMALIST_PURITY: 80, AUTHENTIC_EXPRESSION: 50, ORGANIC_NATURALISM: 40 },
    ontologic: { MATERIALIST_BASE: 90, IDEALIST_MIND: 10, DETERMINIST_CAUSATION: 70, LIBERTARIAN_CHOICE: 30, PROCESS_BECOMING: 40 }
  },
  spiritual_mystic: {
    epistemologic: { EMPIRICAL_DEMAND: 20, AUTHORITY_DEFER: 60, EXPERIENTIAL_TRUST: 90, INTUITIVE_LEAP: 85, SKEPTICAL_DEFAULT: 30 },
    axiologic: { TRANSCENDENT_SOURCE: 90, IMMANENT_CREATION: 40, TELEOLOGICAL_ARC: 80, COMMUNAL_BELONGING: 70, AESTHETIC_APPRECIATION: 85 },
    anthropologic: { AUTONOMOUS_AGENT: 30, RELATIONAL_NODE: 80, CULTURAL_CARRIER: 70, EVOLVED_ANIMAL: 20, SPIRITUAL_BEING: 95 },
    economic: { ZERO_SUM_WORLD: 20, POSITIVE_SUM_CREATION: 60, MARKET_OPTIMIZATION: 30, GIFT_ECONOMY: 80, ABUNDANCE_MINDSET: 90 },
    narrative: { LINEAR_PROGRESS: 40, CYCLICAL_RETURN: 80, HEROIC_JOURNEY: 70, COLLECTIVE_SAGA: 80, RANDOM_CHAOS: 20 },
    aesthetic: { CLASSICAL_HARMONY: 60, ROMANTIC_SUBLIME: 90, MINIMALIST_PURITY: 40, AUTHENTIC_EXPRESSION: 85, ORGANIC_NATURALISM: 90 },
    ontologic: { MATERIALIST_BASE: 20, IDEALIST_MIND: 90, DETERMINIST_CAUSATION: 30, LIBERTARIAN_CHOICE: 80, PROCESS_BECOMING: 85 }
  },
  pragmatic_humanist: {
    epistemologic: { EMPIRICAL_DEMAND: 60, AUTHORITY_DEFER: 50, EXPERIENTIAL_TRUST: 70, INTUITIVE_LEAP: 50, SKEPTICAL_DEFAULT: 60 },
    axiologic: { TRANSCENDENT_SOURCE: 30, IMMANENT_CREATION: 80, TELEOLOGICAL_ARC: 60, COMMUNAL_BELONGING: 80, AESTHETIC_APPRECIATION: 70 },
    anthropologic: { AUTONOMOUS_AGENT: 60, RELATIONAL_NODE: 70, CULTURAL_CARRIER: 60, EVOLVED_ANIMAL: 50, SPIRITUAL_BEING: 40 },
    economic: { ZERO_SUM_WORLD: 40, POSITIVE_SUM_CREATION: 70, MARKET_OPTIMIZATION: 50, GIFT_ECONOMY: 60, ABUNDANCE_MINDSET: 60 },
    narrative: { LINEAR_PROGRESS: 60, CYCLICAL_RETURN: 40, HEROIC_JOURNEY: 50, COLLECTIVE_SAGA: 70, RANDOM_CHAOS: 40 },
    aesthetic: { CLASSICAL_HARMONY: 50, ROMANTIC_SUBLIME: 60, MINIMALIST_PURITY: 50, AUTHENTIC_EXPRESSION: 80, ORGANIC_NATURALISM: 60 },
    ontologic: { MATERIALIST_BASE: 50, IDEALIST_MIND: 50, DETERMINIST_CAUSATION: 50, LIBERTARIAN_CHOICE: 70, PROCESS_BECOMING: 60 }
  }
};

const PATTERN_DOMAINS = [
  'epistemologic', 'axiologic', 'anthropologic', 'economic', 'narrative', 'aesthetic', 'ontologic'
];

const DOMAIN_COLORS = {
  epistemologic: '#3b82f6',
  axiologic: '#8b5cf6', 
  anthropologic: '#f59e0b',
  economic: '#10b981',
  narrative: '#ef4444',
  aesthetic: '#ec4899',
  ontologic: '#6366f1'
};

export default function PatternLabPage() {
  const [currentArchetype, setCurrentArchetype] = useState<string>('scientific_rationalist');
  const [selectedDomain, setSelectedDomain] = useState<string>('epistemologic');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [customProfile, setCustomProfile] = useState<PatternProfile>(PATTERN_ARCHETYPES.scientific_rationalist);
  const [patternEvolution, setPatternEvolution] = useState(0);

  const generateRadarChart = (profile: PatternProfile, domain: string) => {
    const domainData = profile[domain as keyof PatternProfile];
    const motifs = Object.keys(domainData);
    const values = Object.values(domainData);
    
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / motifs.length;
    
    const points = motifs.map((motif, index) => {
      const angle = (index * angleStep) - (Math.PI / 2);
      const value = values[index];
      const distance = (value / 100) * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      return { x, y, motif, value, angle };
    });
    
    return points;
  };

  const calculatePatternSimilarity = (profile1: PatternProfile, profile2: PatternProfile) => {
    let totalSimilarity = 0;
    let totalDimensions = 0;
    
    PATTERN_DOMAINS.forEach(domain => {
      const data1 = profile1[domain as keyof PatternProfile];
      const data2 = profile2[domain as keyof PatternProfile];
      
      Object.keys(data1).forEach(motif => {
        const diff = Math.abs(data1[motif as keyof typeof data1] - data2[motif as keyof typeof data2]);
        totalSimilarity += (100 - diff);
        totalDimensions++;
      });
    });
    
    return totalSimilarity / totalDimensions;
  };

  const PatternRadar = ({ profile, domain, title }: { profile: PatternProfile; domain: string; title: string }) => {
    const points = generateRadarChart(profile, domain);
    const pathData = points.map(p => `${p.x},${p.y}`).join(' ');
    
    return (
      <div className="relative">
        <h4 className="text-center text-sm font-semibold mb-2" style={{ color: DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] }}>
          {title}
        </h4>
        <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
          {/* Grid circles */}
          {[25, 50, 75, 100].map(r => (
            <circle
              key={r}
              cx="150"
              cy="150"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {points.map((point, index) => (
            <line
              key={index}
              x1="150"
              y1="150"
              x2={150 + Math.cos(point.angle) * 100}
              y2={150 + Math.sin(point.angle) * 100}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          ))}
          
          {/* Value polygon */}
          <polygon
            points={pathData}
            fill={`${DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]}40`}
            stroke={DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]}
            strokeWidth="2"
          />
          
          {/* Value points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]}
            />
          ))}
          
          {/* Labels */}
          {points.map((point, index) => {
            const labelX = 150 + Math.cos(point.angle) * 120;
            const labelY = 150 + Math.sin(point.angle) * 120;
            return (
              <text
                key={index}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs fill-gray-300"
              >
                {point.motif.split('_')[0]}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const PatternEvolutionTimeline = () => {
    const evolutionSteps = [
      { age: 20, label: 'Young Adult', profile: 'scientific_rationalist' },
      { age: 35, label: 'Mid-Career', profile: 'pragmatic_humanist' },
      { age: 50, label: 'Mature', profile: 'spiritual_mystic' },
    ];
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold">Pattern Evolution Timeline</h4>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
          {evolutionSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                Age {step.age}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{step.label}</h5>
                <p className="text-xs text-gray-400">
                  Primary archetype: {step.profile.replace('_', ' ')}
                </p>
                <div className="mt-2 flex gap-2">
                  {PATTERN_DOMAINS.slice(0, 4).map(domain => {
                    const profile = PATTERN_ARCHETYPES[step.profile];
                    const domainData = profile[domain as keyof PatternProfile];
                    const avgValue = Object.values(domainData).reduce((a, b) => a + b, 0) / Object.values(domainData).length;
                    return (
                      <div
                        key={domain}
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor: DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS],
                          opacity: avgValue / 100
                        }}
                        title={`${domain}: ${avgValue.toFixed(0)}%`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CrossDomainCorrelations = () => {
    const profile = PATTERN_ARCHETYPES[currentArchetype];
    const correlations = [];
    
    // Calculate correlations between domains
    for (let i = 0; i < PATTERN_DOMAINS.length; i++) {
      for (let j = i + 1; j < PATTERN_DOMAINS.length; j++) {
        const domain1 = PATTERN_DOMAINS[i];
        const domain2 = PATTERN_DOMAINS[j];
        
        const data1 = Object.values(profile[domain1 as keyof PatternProfile]);
        const data2 = Object.values(profile[domain2 as keyof PatternProfile]);
        
        // Simple correlation calculation
        const mean1 = data1.reduce((a, b) => a + b, 0) / data1.length;
        const mean2 = data2.reduce((a, b) => a + b, 0) / data2.length;
        
        let correlation = 0;
        for (let k = 0; k < Math.min(data1.length, data2.length); k++) {
          correlation += (data1[k] - mean1) * (data2[k] - mean2);
        }
        correlation = correlation / Math.min(data1.length, data2.length);
        correlation = correlation / 100; // Normalize
        
        correlations.push({
          domain1,
          domain2,
          correlation: Math.abs(correlation),
          strength: Math.abs(correlation) > 0.3 ? 'strong' : Math.abs(correlation) > 0.1 ? 'moderate' : 'weak'
        });
      }
    }
    
    return (
      <div className="space-y-3">
        <h4 className="font-semibold">Cross-Domain Correlations</h4>
        {correlations
          .filter(c => c.strength !== 'weak')
          .sort((a, b) => b.correlation - a.correlation)
          .slice(0, 5)
          .map((corr, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="flex gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: DOMAIN_COLORS[corr.domain1 as keyof typeof DOMAIN_COLORS] }}
                />
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: DOMAIN_COLORS[corr.domain2 as keyof typeof DOMAIN_COLORS] }}
                />
              </div>
              <span className="flex-1">
                {corr.domain1} ↔ {corr.domain2}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                corr.strength === 'strong' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
              }`}>
                {(corr.correlation * 100).toFixed(0)}%
              </span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pattern Discovery Laboratory
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Mapping the multi-dimensional signatures of human meaning-making across epistemologic, axiologic, anthropologic, economic, narrative, aesthetic, and ontologic domains
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Pattern Analysis Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Archetype</label>
                <select
                  value={currentArchetype}
                  onChange={(e) => setCurrentArchetype(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  {Object.keys(PATTERN_ARCHETYPES).map(archetype => (
                    <option key={archetype} value={archetype}>
                      {archetype.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Domain Focus</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  {PATTERN_DOMAINS.map(domain => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Analysis Mode</label>
                <Button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  variant={comparisonMode ? "default" : "outline"}
                  className="w-full"
                >
                  {comparisonMode ? 'Comparison Active' : 'Single Profile'}
                </Button>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Pattern Evolution</label>
                <Slider
                  value={[patternEvolution]}
                  onValueChange={([value]) => setPatternEvolution(value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Pattern Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Single Domain Radar */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎯 {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Patterns
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: DOMAIN_COLORS[selectedDomain as keyof typeof DOMAIN_COLORS] }}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatternRadar
                  profile={PATTERN_ARCHETYPES[currentArchetype]}
                  domain={selectedDomain}
                  title={currentArchetype.replace('_', ' ')}
                />
              </CardContent>
            </Card>

            {/* Multi-Domain Overview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">🌐 Multi-Domain Pattern Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {PATTERN_DOMAINS.map(domain => {
                    const profile = PATTERN_ARCHETYPES[currentArchetype];
                    const domainData = profile[domain as keyof PatternProfile];
                    const avgValue = Object.values(domainData).reduce((a, b) => a + b, 0) / Object.values(domainData).length;
                    
                    return (
                      <div
                        key={domain}
                        className="text-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedDomain(domain)}
                      >
                        <div
                          className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS],
                            opacity: selectedDomain === domain ? 1 : 0.6
                          }}
                        >
                          {avgValue.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-300">
                          {domain.slice(0, 8)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {comparisonMode && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">🔬 Archetype Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.keys(PATTERN_ARCHETYPES).map(archetype => (
                      <PatternRadar
                        key={archetype}
                        profile={PATTERN_ARCHETYPES[archetype]}
                        domain={selectedDomain}
                        title={archetype.replace('_', ' ')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            {/* Pattern Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">📊 Pattern Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Domain Diversity</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: '73%' }}
                      />
                    </div>
                    <span className="text-xs">73%</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Pattern Coherence</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '68%' }}
                      />
                    </div>
                    <span className="text-xs">68%</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Cultural Variance</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: '45%' }}
                      />
                    </div>
                    <span className="text-xs">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Domain Correlations */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">🕸️ Pattern Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <CrossDomainCorrelations />
              </CardContent>
            </Card>

            {/* Pattern Evolution */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">⏰ Temporal Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <PatternEvolutionTimeline />
              </CardContent>
            </Card>

            {/* Research Hypotheses */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">🧪 Active Hypotheses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-2">
                  <div className="p-2 bg-blue-900/50 rounded">
                    <strong>H1.A.1:</strong> Evidence preference patterns correlate with ontological commitments
                  </div>
                  <div className="p-2 bg-purple-900/50 rounded">
                    <strong>H2.C.2:</strong> Temporal significance decay varies by narrative structure
                  </div>
                  <div className="p-2 bg-green-900/50 rounded">
                    <strong>H6.B.1:</strong> Aesthetic novelty preference predicts economic innovation attitudes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pattern Discovery Pipeline */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🔄 Pattern Discovery Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-blue-400 mb-2">Data Collection</h4>
                <p className="text-xs text-gray-300">
                  Multi-modal capture: choices, timing, reasoning, linguistic patterns, interaction behaviors
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-semibold text-purple-400 mb-2">Pattern Extraction</h4>
                <p className="text-xs text-gray-300">
                  TF-IDF across domains, temporal trajectory analysis, cross-cultural validation
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-semibold text-yellow-400 mb-2">Meta-Pattern Discovery</h4>
                <p className="text-xs text-gray-300">
                  Cross-domain correlations, emergence detection, archetype identification
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-semibold text-green-400 mb-2">Validation</h4>
                <p className="text-xs text-gray-300">
                  External correlation, longitudinal stability, predictive validity testing
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-red-400 mb-2">Application</h4>
                <p className="text-xs text-gray-300">
                  Personal AI alignment, cultural translation, collective intelligence systems
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}