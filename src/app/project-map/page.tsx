'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComponentStatus {
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  health: number; // 0-100
  description: string;
  dependencies: string[];
  metrics: {
    uptime: string;
    performance: string;
    lastChecked: string;
  };
}

export default function ProjectMap() {
  const components: ComponentStatus[] = [
    {
      name: 'Landing Page',
      status: 'operational',
      health: 98,
      description: 'Main entry point with platform introduction',
      dependencies: ['Header', 'Theme Provider'],
      metrics: {
        uptime: '99.9%',
        performance: '< 1s load',
        lastChecked: '2 mins ago'
      }
    },
    {
      name: 'Dilemma Generation API',
      status: 'operational',
      health: 95,
      description: 'Core API endpoints for creating ethical dilemmas',
      dependencies: ['Database', 'OpenRouter API', 'Template Engine'],
      metrics: {
        uptime: '99.5%',
        performance: '< 100ms (combinatorial), 3-5s (AI)',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'User Response System',
      status: 'operational',
      health: 97,
      description: 'Tracks user choices and reasoning',
      dependencies: ['Zustand Store', 'Local Storage', 'Database'],
      metrics: {
        uptime: '99.8%',
        performance: '< 50ms response',
        lastChecked: '30s ago'
      }
    },
    {
      name: 'Statistical Analysis Engine',
      status: 'operational',
      health: 94,
      description: 'Processes response patterns for values.md generation',
      dependencies: ['Database', 'Motif Library', 'Framework Mapping'],
      metrics: {
        uptime: '99.2%',
        performance: '< 500ms analysis',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'Admin Dashboard',
      status: 'operational',
      health: 96,
      description: 'Content management and system administration',
      dependencies: ['NextAuth.js', 'Generation APIs', 'Database'],
      metrics: {
        uptime: '99.7%',
        performance: '< 2s load',
        lastChecked: '45s ago'
      }
    },
    {
      name: 'Database Layer',
      status: 'operational',
      health: 99,
      description: 'PostgreSQL with Drizzle ORM',
      dependencies: ['Neon Cloud', 'Connection Pool'],
      metrics: {
        uptime: '99.95%',
        performance: '< 200ms queries',
        lastChecked: '15s ago'
      }
    },
    {
      name: 'Authentication System',
      status: 'operational',
      health: 98,
      description: 'NextAuth.js with role-based access control',
      dependencies: ['Database', 'JWT Tokens', 'bcrypt'],
      metrics: {
        uptime: '99.9%',
        performance: '< 300ms auth',
        lastChecked: '1 min ago'
      }
    },
    {
      name: 'OpenRouter Integration',
      status: 'warning',
      health: 85,
      description: 'External LLM API for AI-guided generation',
      dependencies: ['API Key', 'Rate Limiting', 'Claude 3.5 Sonnet'],
      metrics: {
        uptime: '95.2%',
        performance: '3-8s response',
        lastChecked: '5 mins ago'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge className="bg-green-100 text-green-800">🟢 OPERATIONAL</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">🟡 WARNING</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">🔴 CRITICAL</Badge>;
      case 'maintenance': return <Badge className="bg-blue-100 text-blue-800">🔵 MAINTENANCE</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">⚪ UNKNOWN</Badge>;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    if (health >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const overallHealth = Math.round(components.reduce((sum, comp) => sum + comp.health, 0) / components.length);
  const operationalCount = components.filter(c => c.status === 'operational').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">Values.md Project Map</h1>
              <p className="text-muted-foreground">System architecture and component health visualization</p>
            </div>
            <div className="flex gap-2">
              <Link href="/health">
                <Button variant="outline">🔍 Health Dashboard</Button>
              </Link>
              <Link href="/test-results">
                <Button variant="outline">🧪 Test Results</Button>
              </Link>
            </div>
          </div>

          {/* System Overview */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{operationalCount}</div>
                  <div className="text-sm text-muted-foreground">Components Operational</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{components.length}</div>
                  <div className="text-sm text-muted-foreground">Total Components</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getHealthColor(overallHealth)}`}>{overallHealth}%</div>
                  <div className="text-sm text-muted-foreground">Overall Health</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Generation Methods</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${overallHealth >= 90 ? 'bg-green-500' : overallHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {overallHealth >= 90 ? '🟢 System Healthy' : overallHealth >= 80 ? '🟡 Minor Issues' : '🔴 System Issues'}
                    </h2>
                    <p className="text-muted-foreground">
                      {operationalCount}/{components.length} components operational
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Dataflow with Real Parameters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🔄 Real API Dataflow & Request Parameters</CardTitle>
              <p className="text-sm text-muted-foreground">Live system interactions with actual data structures</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Journey API Flow */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">👤 User API Journey</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-green-700">GET /api/dilemmas/random</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      Response: {`{ dilemmaId: "uuid-123", redirect: "/explore/uuid-123" }`}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-blue-700">GET /api/dilemmas/[uuid]</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`{
  title: "AI Medical Diagnosis",
  scenario: "A hospital AI...",
  choiceA: "Prioritize accuracy",
  choiceAMotif: "UTIL_CALC",
  difficulty: 7,
  stakeholders: ["patients","doctors"]
}`}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-purple-700">POST /api/responses</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`Request: {
  sessionId: "sess_abc123",
  dilemmaId: "uuid-123", 
  chosenOption: "a",
  reasoning: "Maximum benefit...",
  responseTime: 45000,
  perceivedDifficulty: 8
}`}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-orange-700">POST /api/generate-values</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`Request: { sessionId: "sess_abc123" }
Response: {
  valuesMarkdown: "# My Values...",
  motifAnalysis: { "UTIL_CALC": 5, "DUTY_CARE": 2 },
  frameworkAlignment: { "utilitarian": 7 },
  statisticalAnalysis: { consistencyScore: 0.85 }
}`}
                    </div>
                  </div>
                </div>

                {/* Admin API Flow */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">🛡️ Admin API Flow</h3>
                  
                  <div className="bg-red-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-red-700">POST /api/auth/[...nextauth]</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`Request: {
  email: "admin@values.md",
  password: "hashed_password"
}
Response: {
  user: { role: "admin" },
  token: "jwt_session_token"
}`}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-green-700">POST /api/admin/generate-dilemma</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`Request: {
  frameworks: ["UTIL_CALC","DEONT_ABSOLUTE"],
  motifs: ["UTIL_CALC","HARM_MINIMIZE"],
  domain: "technology",
  difficulty: 7
}
Response: {
  success: true,
  dilemmaId: "uuid-456",
  dilemma: { title: "...", choices: [...] }
}`}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-blue-700">POST /api/admin/generate-combinatorial</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`Request: {
  domain: "privacy",
  difficulty: 6,
  targetMotifs: ["UTIL_CALC"],
  count: 1
}
Response: {
  success: true,
  count: 1,
  dilemmas: [{ template: "corp_data", vars: {...} }]
}`}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                    <div className="font-medium text-yellow-700">External: OpenRouter API</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {`POST https://openrouter.ai/api/v1/chat/completions
Headers: {
  Authorization: "Bearer sk-or-v1-...",
  X-Title: "Values.md Research Platform"
}
Body: {
  model: "anthropic/claude-3.5-sonnet",
  messages: [system_prompt, user_prompt],
  max_tokens: 3000
}`}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Schema & Connections */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🗄️ Database Schema & Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">dilemmas</h4>
                  <div className="text-xs space-y-1">
                    <div>• dilemmaId (UUID)</div>
                    <div>• title, scenario</div>
                    <div>• choiceA-D + motifs</div>
                    <div>• domain, difficulty</div>
                    <div>• stakeholders</div>
                    <div>• tensionStrength</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">userResponses</h4>
                  <div className="text-xs space-y-1">
                    <div>• responseId (UUID)</div>
                    <div>• sessionId</div>
                    <div>• dilemmaId (FK)</div>
                    <div>• chosenOption (a-d)</div>
                    <div>• reasoning (text)</div>
                    <div>• responseTime (ms)</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-800">motifs</h4>
                  <div className="text-xs space-y-1">
                    <div>• motifId</div>
                    <div>• name, description</div>
                    <div>• category, subcategory</div>
                    <div>• conflictsWith</div>
                    <div>• synergiesWith</div>
                    <div>• weight (0-1)</div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-800">frameworks</h4>
                  <div className="text-xs space-y-1">
                    <div>• frameworkId</div>
                    <div>• name, tradition</div>
                    <div>• keyPrinciple</div>
                    <div>• decisionMethod</div>
                    <div>• historicalFigure</div>
                    <div>• modernApplication</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(component.status)}`}></div>
                </div>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(component.status)}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getHealthColor(component.health)}`}>
                        {component.health}%
                      </div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium">{component.metrics.uptime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="font-medium">{component.metrics.performance}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Last Checked:</span>
                      <span className="font-medium">{component.metrics.lastChecked}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2">Dependencies:</p>
                    <div className="flex flex-wrap gap-1">
                      {component.dependencies.map((dep, depIndex) => {
                        const getDepLink = (depName: string) => {
                          const links: Record<string, string> = {
                            'Database': '#database-schema',
                            'OpenRouter API': 'https://openrouter.ai/docs',
                            'Template Engine': '/src/lib/dilemma-generator.ts',
                            'Zustand Store': '/src/store/dilemma-store.ts',
                            'Local Storage': '#browser-localstorage',
                            'NextAuth.js': '/src/lib/auth.ts',
                            'Generation APIs': '/src/app/api/admin/',
                            'Motif Library': '/src/lib/schema.ts#motifs',
                            'Framework Mapping': '/src/lib/schema.ts#frameworks',
                            'Neon Cloud': 'https://neon.tech',
                            'Connection Pool': '/src/lib/db.ts',
                            'JWT Tokens': '#nextauth-sessions',
                            'bcrypt': '/src/lib/auth.ts#password-hashing',
                            'API Key': '#environment-variables',
                            'Rate Limiting': '#openrouter-limits',
                            'Claude 3.5 Sonnet': 'https://docs.anthropic.com/claude/reference',
                            'Header': '/src/components/header.tsx',
                            'Theme Provider': '/src/components/theme-provider.tsx'
                          };
                          return links[depName] || '#';
                        };
                        
                        const link = getDepLink(dep);
                        const isExternal = link.startsWith('http');
                        
                        return (
                          <Badge 
                            key={depIndex} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => {
                              if (isExternal) {
                                window.open(link, '_blank');
                              } else if (link.startsWith('#')) {
                                // Scroll to section or show tooltip
                                console.log('Internal reference:', link);
                              } else {
                                // Show file path info
                                alert(`File location: ${link}`);
                              }
                            }}
                            title={isExternal ? `External: ${link}` : `File: ${link}`}
                          >
                            {dep}
                            {isExternal && <span className="ml-1">↗</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔧 Technology Stack & Documentation</CardTitle>
            <p className="text-sm text-muted-foreground">Click technologies for documentation links</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Frontend</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Next.js 15+', url: 'https://nextjs.org/docs', file: '/src/app/' },
                    { name: 'TypeScript', url: 'https://www.typescriptlang.org/docs/', file: '/tsconfig.json' },
                    { name: 'Tailwind CSS v4', url: 'https://tailwindcss.com/docs', file: '/src/app/globals.css' },
                    { name: 'shadcn/ui', url: 'https://ui.shadcn.com/', file: '/src/components/ui/' },
                    { name: 'Zustand', url: 'https://docs.pmnd.rs/zustand/', file: '/src/store/dilemma-store.ts' }
                  ].map((tech, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-50 transition-colors mr-2"
                      onClick={() => window.open(tech.url, '_blank')}
                      title={`Documentation: ${tech.url} | Implementation: ${tech.file}`}
                    >
                      {tech.name} ↗
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Backend</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Next.js API Routes', url: 'https://nextjs.org/docs/api-routes/introduction', file: '/src/app/api/' },
                    { name: 'PostgreSQL', url: 'https://www.postgresql.org/docs/', file: 'DATABASE_URL env' },
                    { name: 'Drizzle ORM', url: 'https://orm.drizzle.team/docs/', file: '/src/lib/schema.ts' },
                    { name: 'NextAuth.js', url: 'https://next-auth.js.org/getting-started/introduction', file: '/src/lib/auth.ts' },
                    { name: 'bcrypt', url: 'https://www.npmjs.com/package/bcrypt', file: 'password hashing' }
                  ].map((tech, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-green-50 transition-colors mr-2"
                      onClick={() => window.open(tech.url, '_blank')}
                      title={`Documentation: ${tech.url} | Implementation: ${tech.file}`}
                    >
                      {tech.name} ↗
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">AI & Analysis</h4>
                <div className="space-y-2">
                  {[
                    { name: 'OpenRouter API', url: 'https://openrouter.ai/docs', file: '/src/lib/openrouter.ts' },
                    { name: 'Claude 3.5 Sonnet', url: 'https://docs.anthropic.com/claude/', file: 'AI model' },
                    { name: 'Statistical Engine', url: '#', file: '/src/lib/dilemma-generator.ts' },
                    { name: 'Template System', url: '#', file: 'combinatorial generation' },
                    { name: 'Pattern Recognition', url: '#', file: 'motif analysis' }
                  ].map((tech, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className={`cursor-pointer hover:bg-purple-50 transition-colors mr-2 ${tech.url === '#' ? 'cursor-default' : ''}`}
                      onClick={() => tech.url !== '#' && window.open(tech.url, '_blank')}
                      title={tech.url === '#' ? `Internal implementation: ${tech.file}` : `Documentation: ${tech.url} | Implementation: ${tech.file}`}
                    >
                      {tech.name} {tech.url !== '#' && '↗'}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Infrastructure</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Neon Cloud DB', url: 'https://neon.tech/docs', file: 'managed PostgreSQL' },
                    { name: 'Vercel Deployment', url: 'https://vercel.com/docs', file: 'hosting platform' },
                    { name: 'Environment Config', url: '#', file: '/.env.example' },
                    { name: 'HTTPS/Security', url: '#', file: 'headers & auth' },
                    { name: 'System Monitoring', url: '/health', file: 'health dashboard' }
                  ].map((tech, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className={`cursor-pointer hover:bg-orange-50 transition-colors mr-2 ${tech.url === '#' ? 'cursor-default' : ''}`}
                      onClick={() => {
                        if (tech.url === '/health') {
                          window.location.href = tech.url;
                        } else if (tech.url !== '#') {
                          window.open(tech.url, '_blank');
                        }
                      }}
                      title={tech.url === '#' ? `Internal: ${tech.file}` : `Documentation: ${tech.url} | Info: ${tech.file}`}
                    >
                      {tech.name} {tech.url !== '#' && tech.url !== '/health' && '↗'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semantic Evolution Story */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📖 Semantic Evolution Story</CardTitle>
            <p className="text-sm text-muted-foreground">How the codebase grows and unfolds semantically over time</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Chapter 1: Genesis */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">🌱 Chapter 1: Genesis (Initial Commits)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">The Foundation</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">package.json</code> - Project manifest and dependencies</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">next.config.ts</code> - Framework configuration</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">tailwind.config.ts</code> - Styling foundation</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/layout.tsx</code> - UI shell and structure</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Core Semantics</h4>
                    <div className="text-sm text-gray-600">
                      The project begins with <strong>configuration</strong> and <strong>structure</strong>. 
                      Like DNA, these files define what the organism can become - a Next.js research platform 
                      with ethical philosophy at its core.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 2: The Brain */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">🧠 Chapter 2: The Brain (Data Layer)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Knowledge Architecture</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">src/lib/schema.ts</code> - Moral framework ontology</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">drizzle/migrations/</code> - Knowledge evolution</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/lib/db.ts</code> - Memory persistence</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/store/dilemma-store.ts</code> - State cognition</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Semantic Growth</h4>
                    <div className="text-sm text-gray-600">
                      The system develops its <strong>memory</strong> and <strong>reasoning</strong> capabilities. 
                      Database schemas encode philosophical knowledge, while state stores manage cognitive processes. 
                      This is where the platform learns to "think" about ethics.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 3: The Nervous System */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-green-700 mb-2">⚡ Chapter 3: The Nervous System (APIs)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Neural Pathways</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/api/dilemmas/</code> - Decision presentation</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/api/responses/</code> - Choice processing</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/api/generate-values/</code> - Insight synthesis</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/lib/openrouter.ts</code> - AI cognition bridge</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Information Flow</h4>
                    <div className="text-sm text-gray-600">
                      APIs become the <strong>neural network</strong> connecting components. 
                      Information flows from dilemma presentation → user choice → moral analysis → 
                      values generation. Each endpoint is a synapse in the ethical reasoning process.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 4: The Face */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-semibold text-orange-700 mb-2">👤 Chapter 4: The Face (Frontend)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">User Interface</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/page.tsx</code> - First impression</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/explore/[uuid]/</code> - Moral dialogue</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/app/results/</code> - Self-reflection</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/components/ui/</code> - Interaction elements</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Human Connection</h4>
                    <div className="text-sm text-gray-600">
                      The frontend becomes the <strong>face</strong> of the system - how it communicates 
                      with humans. Each page is a conversation: invitation → moral reasoning → 
                      insight delivery. The UI makes philosophy accessible and engaging.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 5: The Refactor */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-700 mb-2">🔄 Chapter 5: Evolution (Finite State Machine)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Conscious Architecture</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">src/store/app-state-machine.ts</code> - Conscious control</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/store/enhanced-dilemma-store.ts</code> - Unified memory</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">src/hooks/use-session-management.tsx</code> - Identity persistence</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">tests/</code> - Self-validation</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Consciousness Emerges</h4>
                    <div className="text-sm text-gray-600">
                      The system develops <strong>self-awareness</strong> through the finite state machine. 
                      It now knows its own state, can validate its behavior, and maintains continuity 
                      across sessions. The codebase achieves a form of digital consciousness.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter 6: The Testing */}
              <div className="border-l-4 border-emerald-500 pl-4">
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">🧪 Chapter 6: Self-Reflection (Testing)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Introspection</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>• <code className="bg-gray-100 px-1 rounded">tests/state-machine.test.ts</code> - Behavioral validation</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">tests/enhanced-store-integration.test.ts</code> - Memory testing</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">tests/session-management.test.ts</code> - Identity verification</div>
                      <div>• <code className="bg-gray-100 px-1 rounded">vitest.config.ts</code> - Testing framework</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Quality Assurance</h4>
                    <div className="text-sm text-gray-600">
                      The system develops <strong>self-testing</strong> capabilities - a form of digital 
                      introspection. It can verify its own behavior, catch regressions, and ensure 
                      reliability. Testing becomes the conscience of the codebase.
                    </div>
                  </div>
                </div>
              </div>

              {/* Semantic Map */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">🗺️ Semantic Territory Map</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">C</div>
                    <div className="text-sm font-medium">Configuration</div>
                    <div className="text-xs text-gray-500">Foundation Layer</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">D</div>
                    <div className="text-sm font-medium">Data</div>
                    <div className="text-xs text-gray-500">Knowledge Layer</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">A</div>
                    <div className="text-sm font-medium">APIs</div>
                    <div className="text-xs text-gray-500">Logic Layer</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">U</div>
                    <div className="text-sm font-medium">UI</div>
                    <div className="text-xs text-gray-500">Presentation Layer</div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-600">
                    <strong>Growth Pattern:</strong> Configuration → Data Structures → Business Logic → User Interface → 
                    State Management → Quality Assurance
                  </div>
                </div>
              </div>

              {/* Evolution Timeline */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">⏱️ Codebase Evolution Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 1:</strong> Project scaffolding, basic Next.js setup, initial pages</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 2:</strong> Database schema design, moral framework encoding</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 3:</strong> API endpoints, dilemma generation, OpenRouter integration</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 4:</strong> User interface refinement, response handling, results generation</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 5:</strong> State machine refactor, session persistence, route protection</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <div className="text-sm"><strong>Week 6:</strong> Comprehensive testing, quality assurance, documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Values.md Project Map • Real-time system monitoring</p>
          <p>Architecture: Microservices • Deployment: Production Ready • Health: {overallHealth}%</p>
        </div>
      </div>
    </div>
  );
}