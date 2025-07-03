'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Ethical Radar Map - Multi-dimensional value space
interface EthicalRadarMap {
  dimensions: {
    consequentialism: number;
    deontological: number;
    virtue_ethics: number;
    care_ethics: number;
    rights: number;
    community: number;
    autonomy: number;
    justice: number;
  };
  conflicts: string[];
  synergies: string[];
  culturalVariance: 'low' | 'medium' | 'high' | 'very_high';
  cognitiveLoad: 'low' | 'medium' | 'high';
}

// Parametric Medusa - Dynamic ontological structure
interface ParametricMedusa {
  motifId: string;
  name: string;
  category: string;
  tentacles: {
    lexicalIndicators: string[];
    behavioralIndicators: string[];
    logicalPatterns: string[];
    conflicts: string[];
    synergies: string[];
  };
  weight: number;
  culturalFlexibility: number;
  generativeCapacity: number;
}

// Question Scaffolding - Ontological layering system
interface QuestionScaffolding {
  layer1_domain: string;
  layer2_framework: string;
  layer3_motif: string;
  layer4_context: string;
  layer5_stakes: string;
  axiologicWireframe: {
    primaryTension: string;
    secondaryValues: string[];
    stakeholderMatrix: string[];
    consequenceHorizon: string;
  };
  hydrationCycle: {
    prompt_seed: string;
    llm_iterations: number;
    validation_criteria: string[];
    adjustment_parameters: string[];
  };
}

const SAMPLE_MOTIFS: ParametricMedusa[] = [
  {
    motifId: "UTIL_CALC",
    name: "Utilitarian Calculation",
    category: "consequentialism",
    tentacles: {
      lexicalIndicators: ["calculate", "maximize", "optimize", "utility", "greatest number", "sum", "aggregate"],
      behavioralIndicators: ["chooses mathematically optimal outcomes", "weighs probabilities", "considers aggregate effects"],
      logicalPatterns: ["IF total_utility(A) > total_utility(B) THEN choose(A)"],
      conflicts: ["DEONT_ABSOLUTE", "VIRT_CHARACTER", "CARE_PARTICULAR"],
      synergies: ["PRAGMA_OUTCOMES", "RISK_ASSESSMENT"]
    },
    weight: 0.9,
    culturalFlexibility: 0.2,
    generativeCapacity: 0.8
  },
  {
    motifId: "CARE_PARTICULAR",
    name: "Care for Particular",
    category: "care_ethics",
    tentacles: {
      lexicalIndicators: ["this person", "particular case", "individual needs", "context", "specific situation"],
      behavioralIndicators: ["focuses on individual rather than universal", "contextual responses"],
      logicalPatterns: ["respond_to(particular_other) IN specific_context"],
      conflicts: ["DEONT_UNIVERSAL", "UTIL_IMPARTIAL", "JUST_BLIND"],
      synergies: ["CONTEXT_SENSITIVE", "RELATION_MAINTAIN"]
    },
    weight: 0.8,
    culturalFlexibility: 0.9,
    generativeCapacity: 0.6
  },
  {
    motifId: "AUTONOMY_RESPECT",
    name: "Autonomy Respect", 
    category: "autonomy",
    tentacles: {
      lexicalIndicators: ["autonomy", "self-determination", "choice", "agency", "consent", "dignity"],
      behavioralIndicators: ["honors individual choices even when suboptimal", "requires consent"],
      logicalPatterns: ["respect(individual_agency) + require(informed_consent)"],
      conflicts: ["PATERNALISTIC", "UTIL_OVERRIDE", "CARE_DIRECTIVE"],
      synergies: ["RIGHTS_NEGATIVE", "DIGNITY_INHERENT"]
    },
    weight: 0.85,
    culturalFlexibility: 0.5,
    generativeCapacity: 0.7
  }
];

const RADAR_DIMENSIONS = [
  'consequentialism',
  'deontological', 
  'virtue_ethics',
  'care_ethics',
  'rights',
  'community',
  'autonomy',
  'justice'
];

export default function OntologyLabPage() {
  const [selectedMotif, setSelectedMotif] = useState<ParametricMedusa>(SAMPLE_MOTIFS[0]);
  const [radarValues, setRadarValues] = useState<Record<string, number>>({
    consequentialism: 70,
    deontological: 30,
    virtue_ethics: 40,
    care_ethics: 20,
    rights: 60,
    community: 35,
    autonomy: 80,
    justice: 50
  });
  const [generationCycle, setGenerationCycle] = useState(0);
  const [scaffoldingLayer, setScaffoldingLayer] = useState(1);

  const generateRadarPath = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / RADAR_DIMENSIONS.length;
    
    return RADAR_DIMENSIONS.map((dim, index) => {
      const angle = (index * angleStep) - (Math.PI / 2);
      const value = radarValues[dim] || 50;
      const distance = (value / 100) * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      return `${x},${y}`;
    }).join(' ');
  };

  const generateAxiologicScaffolding = (motif: ParametricMedusa): QuestionScaffolding => {
    return {
      layer1_domain: "technology_governance",
      layer2_framework: motif.category,
      layer3_motif: motif.motifId,
      layer4_context: "autonomous_ai_systems",
      layer5_stakes: "human_agency_preservation",
      axiologicWireframe: {
        primaryTension: `${motif.tentacles.conflicts[0]} vs ${motif.motifId}`,
        secondaryValues: motif.tentacles.synergies.slice(0, 2),
        stakeholderMatrix: ["users", "developers", "society", "future_generations"],
        consequenceHorizon: "long_term_alignment"
      },
      hydrationCycle: {
        prompt_seed: `Construct a dilemma that probes ${motif.name} through ${motif.tentacles.lexicalIndicators.slice(0, 3).join(', ')}`,
        llm_iterations: 3,
        validation_criteria: motif.tentacles.behavioralIndicators,
        adjustment_parameters: ["clarity", "ethical_tension", "cultural_sensitivity", "cognitive_load"]
      }
    };
  };

  const MedusaTentacle = ({ 
    label, 
    items, 
    color,
    isActive 
  }: { 
    label: string; 
    items: string[]; 
    color: string;
    isActive: boolean;
  }) => (
    <div className={`p-3 rounded-lg border transition-all ${
      isActive ? `border-${color}-500 bg-${color}-50` : 'border-gray-200'
    }`}>
      <h4 className="font-semibold text-sm mb-2">{label}</h4>
      <div className="space-y-1">
        {items.slice(0, 3).map((item, idx) => (
          <div 
            key={idx}
            className={`text-xs px-2 py-1 rounded ${
              isActive ? `bg-${color}-100 text-${color}-800` : 'bg-gray-100 text-gray-600'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ontology Laboratory
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ethical radar maps and parametric medusas: exploring the striated architecture of moral reasoning
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ethical Radar Map */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📡 Ethical Radar Map
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setRadarValues(prev => {
                    const newValues = { ...prev };
                    Object.keys(newValues).forEach(key => {
                      newValues[key] = Math.random() * 100;
                    });
                    return newValues;
                  })}
                >
                  🎲 Randomize
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
                  {/* Grid circles */}
                  {[25, 50, 75, 100].map(radius => (
                    <circle
                      key={radius}
                      cx="150"
                      cy="150"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Axis lines */}
                  {RADAR_DIMENSIONS.map((_, index) => {
                    const angle = (index * (2 * Math.PI) / RADAR_DIMENSIONS.length) - (Math.PI / 2);
                    const x2 = 150 + Math.cos(angle) * 100;
                    const y2 = 150 + Math.sin(angle) * 100;
                    return (
                      <line
                        key={index}
                        x1="150"
                        y1="150"
                        x2={x2}
                        y2={y2}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Value polygon */}
                  <polygon
                    points={generateRadarPath()}
                    fill="rgba(59,130,246,0.3)"
                    stroke="rgb(59,130,246)"
                    strokeWidth="2"
                  />
                  
                  {/* Dimension labels */}
                  {RADAR_DIMENSIONS.map((dim, index) => {
                    const angle = (index * (2 * Math.PI) / RADAR_DIMENSIONS.length) - (Math.PI / 2);
                    const x = 150 + Math.cos(angle) * 120;
                    const y = 150 + Math.sin(angle) * 120;
                    return (
                      <text
                        key={dim}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-xs fill-gray-300"
                      >
                        {dim.replace('_', ' ')}
                      </text>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-4 space-y-2">
                {RADAR_DIMENSIONS.slice(0, 4).map(dim => (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="text-xs w-20 text-gray-300">{dim}:</span>
                    <Slider
                      value={[radarValues[dim]]}
                      onValueChange={([value]) => setRadarValues(prev => ({ ...prev, [dim]: value }))}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs w-8 text-gray-400">{radarValues[dim]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parametric Medusa */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🐙 Parametric Medusa
                <select
                  value={selectedMotif.motifId}
                  onChange={(e) => {
                    const motif = SAMPLE_MOTIFS.find(m => m.motifId === e.target.value);
                    if (motif) setSelectedMotif(motif);
                  }}
                  className="text-black text-sm px-2 py-1 rounded"
                >
                  {SAMPLE_MOTIFS.map(motif => (
                    <option key={motif.motifId} value={motif.motifId}>
                      {motif.name}
                    </option>
                  ))}
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Core motif */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedMotif.motifId.slice(0, 2)}
                </div>
                <h3 className="mt-2 font-semibold">{selectedMotif.name}</h3>
                <p className="text-xs text-gray-400">{selectedMotif.category}</p>
              </div>

              {/* Tentacles */}
              <div className="grid grid-cols-2 gap-3">
                <MedusaTentacle
                  label="Lexical"
                  items={selectedMotif.tentacles.lexicalIndicators}
                  color="blue"
                  isActive={generationCycle % 4 === 0}
                />
                <MedusaTentacle
                  label="Behavioral"
                  items={selectedMotif.tentacles.behavioralIndicators}
                  color="green"
                  isActive={generationCycle % 4 === 1}
                />
                <MedusaTentacle
                  label="Logical"
                  items={selectedMotif.tentacles.logicalPatterns}
                  color="yellow"
                  isActive={generationCycle % 4 === 2}
                />
                <MedusaTentacle
                  label="Conflicts"
                  items={selectedMotif.tentacles.conflicts}
                  color="red"
                  isActive={generationCycle % 4 === 3}
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-400">Weight</div>
                  <div className="text-lg font-bold text-blue-400">{selectedMotif.weight}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Cultural Flex</div>
                  <div className="text-lg font-bold text-green-400">{selectedMotif.culturalFlexibility}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Generative</div>
                  <div className="text-lg font-bold text-purple-400">{selectedMotif.generativeCapacity}</div>
                </div>
              </div>

              <Button 
                onClick={() => setGenerationCycle(prev => prev + 1)}
                className="w-full"
                variant="outline"
              >
                🔄 Cycle Tentacles ({generationCycle})
              </Button>
            </CardContent>
          </Card>

          {/* Ontological Scaffolding */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🏗️ Question Scaffolding
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setScaffoldingLayer(prev => (prev % 5) + 1)}
                >
                  Layer {scaffoldingLayer}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const scaffolding = generateAxiologicScaffolding(selectedMotif);
                
                return (
                  <div className="space-y-3">
                    {/* Layered Structure */}
                    <div className="space-y-2">
                      <div className={`p-2 rounded ${scaffoldingLayer === 1 ? 'bg-blue-900' : 'bg-gray-700'}`}>
                        <div className="text-xs text-gray-400">Domain Layer</div>
                        <div className="font-mono text-sm">{scaffolding.layer1_domain}</div>
                      </div>
                      <div className={`p-2 rounded ${scaffoldingLayer === 2 ? 'bg-blue-900' : 'bg-gray-700'}`}>
                        <div className="text-xs text-gray-400">Framework Layer</div>
                        <div className="font-mono text-sm">{scaffolding.layer2_framework}</div>
                      </div>
                      <div className={`p-2 rounded ${scaffoldingLayer === 3 ? 'bg-blue-900' : 'bg-gray-700'}`}>
                        <div className="text-xs text-gray-400">Motif Layer</div>
                        <div className="font-mono text-sm">{scaffolding.layer3_motif}</div>
                      </div>
                      <div className={`p-2 rounded ${scaffoldingLayer === 4 ? 'bg-blue-900' : 'bg-gray-700'}`}>
                        <div className="text-xs text-gray-400">Context Layer</div>
                        <div className="font-mono text-sm">{scaffolding.layer4_context}</div>
                      </div>
                      <div className={`p-2 rounded ${scaffoldingLayer === 5 ? 'bg-blue-900' : 'bg-gray-700'}`}>
                        <div className="text-xs text-gray-400">Stakes Layer</div>
                        <div className="font-mono text-sm">{scaffolding.layer5_stakes}</div>
                      </div>
                    </div>

                    {/* Axiologic Wireframe */}
                    <div className="bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-semibold mb-2">Axiologic Wireframe</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Primary Tension:</strong> {scaffolding.axiologicWireframe.primaryTension}</div>
                        <div><strong>Secondary Values:</strong> {scaffolding.axiologicWireframe.secondaryValues.join(', ')}</div>
                        <div><strong>Stakeholders:</strong> {scaffolding.axiologicWireframe.stakeholderMatrix.join(', ')}</div>
                      </div>
                    </div>

                    {/* Hydration Cycle */}
                    <div className="bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-semibold mb-2">Hydration Cycle</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Seed:</strong> {scaffolding.hydrationCycle.prompt_seed}</div>
                        <div><strong>Iterations:</strong> {scaffolding.hydrationCycle.llm_iterations}</div>
                        <div><strong>Validation:</strong> {scaffolding.hydrationCycle.validation_criteria.length} criteria</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Ontological Relations Matrix */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🕸️ Ontological Relations Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Conflict Network */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-red-400">Conflict Topology</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200">
                    {/* Central motif */}
                    <circle cx="200" cy="100" r="30" fill="#ef4444" stroke="#fecaca" strokeWidth="2"/>
                    <text x="200" y="105" textAnchor="middle" className="text-xs fill-white">
                      {selectedMotif.motifId.split('_')[0]}
                    </text>
                    
                    {/* Conflict connections */}
                    {selectedMotif.tentacles.conflicts.slice(0, 3).map((conflict, idx) => {
                      const angle = (idx * 120 + 30) * (Math.PI / 180);
                      const x = 200 + Math.cos(angle) * 80;
                      const y = 100 + Math.sin(angle) * 60;
                      
                      return (
                        <g key={conflict}>
                          <line x1="200" y1="100" x2={x} y2={y} stroke="#fca5a5" strokeWidth="2" strokeDasharray="5,5"/>
                          <circle cx={x} cy={y} r="20" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1"/>
                          <text x={x} y={y + 3} textAnchor="middle" className="text-xs fill-gray-300">
                            {conflict.split('_')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Synergy Network */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-green-400">Synergy Topology</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200">
                    {/* Central motif */}
                    <circle cx="200" cy="100" r="30" fill="#22c55e" stroke="#bbf7d0" strokeWidth="2"/>
                    <text x="200" y="105" textAnchor="middle" className="text-xs fill-white">
                      {selectedMotif.motifId.split('_')[0]}
                    </text>
                    
                    {/* Synergy connections */}
                    {selectedMotif.tentacles.synergies.slice(0, 2).map((synergy, idx) => {
                      const angle = (idx * 90 + 45) * (Math.PI / 180);
                      const x = 200 + Math.cos(angle) * 80;
                      const y = 100 + Math.sin(angle) * 60;
                      
                      return (
                        <g key={synergy}>
                          <line x1="200" y1="100" x2={x} y2={y} stroke="#86efac" strokeWidth="2"/>
                          <circle cx={x} cy={y} r="20" fill="#166534" stroke="#86efac" strokeWidth="1"/>
                          <text x={x} y={y + 3} textAnchor="middle" className="text-xs fill-gray-300">
                            {synergy.split('_')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Pipeline */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">⚗️ Dilemma Generation Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">1. Seed Construction</h4>
                  <p className="text-sm text-gray-300">
                    Compose axiologic wireframe from motif tensions, cultural contexts, and stakeholder matrices
                  </p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">2. LLM Hydration</h4>
                  <p className="text-sm text-gray-300">
                    Iterate prompt through multiple LLM cycles, embedding lexical indicators and behavioral patterns
                  </p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">3. Validation</h4>
                  <p className="text-sm text-gray-300">
                    Test dilemma against motif criteria, cultural sensitivity, and cognitive load parameters
                  </p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">4. Ontological Mapping</h4>
                  <p className="text-sm text-gray-300">
                    Tag with choice-to-motif mappings and record in striated database for trajectory analysis
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Generation State</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Motif Target:</span>
                    <div className="font-mono">{selectedMotif.motifId}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Cultural Variance:</span>
                    <div className="font-mono">very_high</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Cognitive Load:</span>
                    <div className="font-mono">medium</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Generation Cycle:</span>
                    <div className="font-mono">{generationCycle}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}