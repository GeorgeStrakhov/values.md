'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Experiment {
  id: string;
  title: string;
  description: string;
  status: 'conceptual' | 'proposed' | 'pilot' | 'active';
  domain: string;
  participants?: number;
  hypothesis: string;
  expectedOutcome: string;
  applications: string[];
}

const gedankenExperiments: Experiment[] = [
  {
    id: 'cultural-adaptation',
    title: 'Cross-Cultural Values Mapping',
    description: 'How do ethical preferences vary across cultural contexts? Can we generate culturally-adapted values.md files?',
    status: 'proposed',
    domain: 'anthropology',
    hypothesis: 'Different cultural backgrounds will show systematic variations in motif preferences, particularly around individual vs. collective values',
    expectedOutcome: 'Cultural value signatures that enable context-aware AI alignment',
    applications: ['Global AI deployment', 'Cultural sensitivity training', 'International policy AI']
  },
  {
    id: 'temporal-consistency',
    title: 'Values Stability Over Time',
    description: 'Do personal values remain consistent? How do life events affect ethical preferences?',
    status: 'conceptual',
    domain: 'psychology',
    hypothesis: 'Core values remain stable (~80% consistency) but priority rankings shift with major life events',
    expectedOutcome: 'Dynamic values.md files that adapt to life changes while maintaining ethical core',
    applications: ['Personal AI assistants', 'Long-term decision support', 'Life coaching AI']
  },
  {
    id: 'ai-human-divergence',
    title: 'AI-Human Ethical Alignment Gaps',
    description: 'Where do LLMs systematically differ from human moral reasoning? Can we close these gaps?',
    status: 'pilot',
    domain: 'ai-safety',
    participants: 150,
    hypothesis: 'LLMs show systematic bias toward utilitarian calculations and struggle with contextual care ethics',
    expectedOutcome: 'Targeted training data for improving AI moral reasoning alignment',
    applications: ['LLM fine-tuning', 'AI safety research', 'Ethical AI development']
  },
  {
    id: 'professional-adaptation',
    title: 'Domain-Specific Professional Ethics',
    description: 'How do professional contexts shape ethical reasoning? Can we generate role-specific values.md files?',
    status: 'active',
    domain: 'professional-ethics',
    participants: 300,
    hypothesis: 'Professional training creates systematic ethical pattern shifts while preserving personal core values',
    expectedOutcome: 'Professional values.md templates for context-aware workplace AI',
    applications: ['Corporate AI assistants', 'Professional decision support', 'Ethics training']
  },
  {
    id: 'collective-intelligence',
    title: 'Group Values Emergence',
    description: 'How do teams develop shared ethical frameworks? Can we generate collective values.md files?',
    status: 'conceptual',
    domain: 'social-psychology',
    hypothesis: 'Group values emerge through negotiation of individual frameworks, showing hybrid patterns',
    expectedOutcome: 'Methods for generating team-level values.md files for collaborative AI',
    applications: ['Team decision support', 'Organizational AI', 'Democratic AI governance']
  },
  {
    id: 'developmental-ethics',
    title: 'Ethical Development Across Lifespan',
    description: 'How do moral reasoning patterns change from childhood through aging? What are the implications for AI?',
    status: 'proposed',
    domain: 'developmental-psychology',
    hypothesis: 'Ethical complexity increases with age, showing shifts from rule-based to contextual reasoning',
    expectedOutcome: 'Age-appropriate values.md generation and AI interaction patterns',
    applications: ['Educational AI', 'Elder care AI', 'Child-safe AI systems']
  }
];

const researchStatistics = {
  totalDilemmas: 100,
  totalFrameworks: 20,
  totalMotifs: 18,
  averageDifficulty: 6.9,
  domainCoverage: 9,
  validationScore: 67,
  userJourneySuccess: 80,
  generationCapacity: 'Unlimited',
  averageSessionTime: '15-20 minutes',
  valuesConsistency: '85%'
};

const futureApplications = [
  {
    category: 'Personal AI',
    applications: [
      'Personalized decision support systems',
      'Values-aligned personal assistants',
      'Ethical reasoning tutors',
      'Life coaching and goal alignment'
    ]
  },
  {
    category: 'Organizational AI',
    applications: [
      'Corporate decision-making systems',
      'HR and hiring algorithm alignment',
      'Values-based team formation',
      'Ethical compliance monitoring'
    ]
  },
  {
    category: 'Societal AI',
    applications: [
      'Democratic participation platforms',
      'Policy analysis and recommendation',
      'Cultural preservation systems',
      'Global cooperation frameworks'
    ]
  },
  {
    category: 'AI Safety & Research',
    applications: [
      'LLM alignment benchmarking',
      'Ethical training data generation',
      'AI safety evaluation frameworks',
      'Human-AI collaboration protocols'
    ]
  }
];

export default function ExperimentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredExperiments = selectedCategory === 'all' 
    ? gedankenExperiments 
    : gedankenExperiments.filter(exp => exp.status === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conceptual': return 'bg-gray-100 text-gray-800';
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'pilot': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Research Experiments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gedankenexperiments, statistics, and hypotheses for advancing the values.md project
          </p>
        </div>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalDilemmas}</div>
                <div className="text-sm text-muted-foreground">Ethical Dilemmas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalFrameworks}</div>
                <div className="text-sm text-muted-foreground">Ethical Frameworks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalMotifs}</div>
                <div className="text-sm text-muted-foreground">Moral Motifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.domainCoverage}</div>
                <div className="text-sm text-muted-foreground">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.generationCapacity}</div>
                <div className="text-sm text-muted-foreground">AI Generation</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Platform Validation Score</span>
                  <span>{researchStatistics.validationScore}%</span>
                </div>
                <Progress value={researchStatistics.validationScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>User Journey Success Rate</span>
                  <span>{researchStatistics.userJourneySuccess}%</span>
                </div>
                <Progress value={researchStatistics.userJourneySuccess} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Values Consistency</span>
                  <span>{researchStatistics.valuesConsistency}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiment Filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Experiments
          </Button>
          <Button 
            variant={selectedCategory === 'active' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('active')}
          >
            Active
          </Button>
          <Button 
            variant={selectedCategory === 'pilot' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('pilot')}
          >
            Pilot
          </Button>
          <Button 
            variant={selectedCategory === 'proposed' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('proposed')}
          >
            Proposed
          </Button>
          <Button 
            variant={selectedCategory === 'conceptual' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('conceptual')}
          >
            Conceptual
          </Button>
        </div>

        {/* Experiments Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredExperiments.map((experiment) => (
            <Card key={experiment.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  <Badge className={getStatusColor(experiment.status)}>
                    {experiment.status}
                  </Badge>
                </div>
                <Badge variant="outline">{experiment.domain}</Badge>
                {experiment.participants && (
                  <div className="text-sm text-muted-foreground">
                    {experiment.participants} participants
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{experiment.description}</p>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Hypothesis</h4>
                  <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Expected Outcome</h4>
                  <p className="text-sm text-muted-foreground">{experiment.expectedOutcome}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Applications</h4>
                  <div className="flex flex-wrap gap-1">
                    {experiment.applications.slice(0, 3).map((app, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                    {experiment.applications.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{experiment.applications.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Future Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Future Applications & Growth</CardTitle>
            <p className="text-muted-foreground">
              Potential applications of the values.md framework across domains
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {futureApplications.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.applications.map((app, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Research Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Research Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Data Collection</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Privacy-first anonymous sessions</li>
                  <li>• Structured ethical dilemma responses</li>
                  <li>• Difficulty perception metrics</li>
                  <li>• Optional demographic data</li>
                  <li>• Reasoning text analysis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analysis Framework</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Motif frequency analysis</li>
                  <li>• Framework alignment scoring</li>
                  <li>• Difficulty-weighted preferences</li>
                  <li>• Conflict and synergy detection</li>
                  <li>• Consistency measurement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Validation Methods</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test-retest reliability</li>
                  <li>• Cross-cultural validation</li>
                  <li>• Expert review panels</li>
                  <li>• AI-human comparison studies</li>
                  <li>• Longitudinal tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-primary/5">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Contribute to Research</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Help advance the values.md project by participating in experiments, 
              suggesting new research directions, or contributing to the open-source platform.
            </p>
            <div className="space-x-4">
              <Button asChild>
                <a href="/api/dilemmas/random">Participate in Study</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/GeorgeStrakhov/values.md" target="_blank">
                  Contribute Code
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}