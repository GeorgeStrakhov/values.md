'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileInfo {
  path: string;
  type: 'frequent' | 'occasional' | 'unreachable' | 'config';
  description: string;
  lastAccess?: string;
}

const repoStructure: FileInfo[] = [
  // Core User Flow - Frequently Executed
  { path: 'src/app/page.tsx', type: 'frequent', description: 'Landing page - main entry point' },
  { path: 'src/app/explore/[uuid]/page.tsx', type: 'frequent', description: 'Dilemma presentation - core flow' },
  { path: 'src/app/results/page.tsx', type: 'frequent', description: 'Results & VALUES.md generation' },
  { path: 'src/app/api/dilemmas/random/route.ts', type: 'frequent', description: 'Random dilemma endpoint' },
  { path: 'src/app/api/dilemmas/[uuid]/route.ts', type: 'frequent', description: 'Individual dilemma endpoint' },
  { path: 'src/app/api/generate-values/route.ts', type: 'frequent', description: 'VALUES.md generation API' },
  { path: 'src/store/dilemma-store.ts', type: 'frequent', description: 'Zustand state management' },
  
  // API & Database - Occasionally Used
  { path: 'src/app/api/responses/route.ts', type: 'occasional', description: 'Research data collection' },
  { path: 'src/app/api/health/route.ts', type: 'occasional', description: 'System health checks' },
  { path: 'src/lib/db.ts', type: 'occasional', description: 'Database connection' },
  { path: 'src/lib/schema.ts', type: 'occasional', description: 'Database schema definitions' },
  { path: 'src/lib/openrouter.ts', type: 'occasional', description: 'LLM API integration' },
  
  // Admin & Research Features - Rarely Used
  { path: 'src/app/admin/page.tsx', type: 'occasional', description: 'Admin panel' },
  { path: 'src/app/api/admin/generate-dilemma/route.ts', type: 'occasional', description: 'Admin dilemma generation' },
  { path: 'src/app/api/admin/change-password/route.ts', type: 'occasional', description: 'Admin password management' },
  { path: 'src/app/research/page.tsx', type: 'occasional', description: 'Research participation info' },
  { path: 'src/app/about/page.tsx', type: 'occasional', description: 'About page' },
  
  // Enhanced Values Generation - Experimental/Unreachable
  { path: 'src/lib/tactic-based-values-generator.ts', type: 'unreachable', description: 'Advanced tactic analysis (disabled)' },
  { path: 'src/lib/enhanced-values-generator.ts', type: 'unreachable', description: 'Mathematical values generation (disabled)' },
  { path: 'src/lib/streamlined-values-generator.ts', type: 'unreachable', description: 'Streamlined generation (unused)' },
  { path: 'src/lib/statistical-foundation.ts', type: 'unreachable', description: 'Statistical analysis (unused)' },
  { path: 'src/lib/validation-protocols.ts', type: 'unreachable', description: 'Validation framework (unused)' },
  
  // Documentation & Content
  { path: 'src/app/blog/page.tsx', type: 'unreachable', description: 'Blog listing (no content)' },
  { path: 'src/app/blog/[slug]/page.tsx', type: 'unreachable', description: 'Blog posts (no content)' },
  { path: 'src/app/docs/page.tsx', type: 'unreachable', description: 'Documentation (no content)' },
  { path: 'src/app/docs/[slug]/page.tsx', type: 'unreachable', description: 'Doc pages (no content)' },
  { path: 'src/components/mdx.tsx', type: 'unreachable', description: 'MDX components (unused)' },
  { path: 'src/lib/mdx.ts', type: 'unreachable', description: 'MDX utilities (unused)' },
  
  // Authentication - Admin Only
  { path: 'src/app/api/auth/[...nextauth]/route.ts', type: 'occasional', description: 'NextAuth endpoints' },
  { path: 'src/lib/auth.ts', type: 'occasional', description: 'Auth configuration' },
  { path: 'src/components/auth-provider.tsx', type: 'occasional', description: 'Auth context provider' },
  
  // UI Components - Mixed Usage
  { path: 'src/components/header.tsx', type: 'frequent', description: 'Main navigation header' },
  { path: 'src/components/progress-bar.tsx', type: 'frequent', description: 'Dilemma progress indicator' },
  { path: 'src/components/progress-context.tsx', type: 'frequent', description: 'Progress state management' },
  { path: 'src/components/theme-provider.tsx', type: 'occasional', description: 'Dark/light theme provider' },
  { path: 'src/components/mode-toggle.tsx', type: 'occasional', description: 'Theme toggle component' },
  
  // Utilities & Configuration
  { path: 'src/lib/utils.ts', type: 'frequent', description: 'Common utility functions' },
  { path: 'next.config.ts', type: 'config', description: 'Next.js configuration' },
  { path: 'tailwind.config.js', type: 'config', description: 'Tailwind CSS configuration' },
  { path: 'drizzle.config.ts', type: 'config', description: 'Database ORM configuration' },
  { path: 'package.json', type: 'config', description: 'Dependencies & scripts' },
  
  // Scripts - Development/Deployment Only
  { path: 'scripts/seed-db.ts', type: 'occasional', description: 'Database seeding' },
  { path: 'scripts/seed-admin.ts', type: 'occasional', description: 'Admin user creation' },
  { path: 'scripts/cleanup-db.ts', type: 'unreachable', description: 'Database cleanup (unused)' },
  { path: 'scripts/reset-schema.ts', type: 'unreachable', description: 'Schema reset (unused)' },
  { path: 'scripts/update-admin-password.ts', type: 'unreachable', description: 'Password update (unused)' },
];

const typeColors = {
  frequent: 'bg-green-100 border-green-300 text-green-800',
  occasional: 'bg-yellow-100 border-yellow-300 text-yellow-800', 
  unreachable: 'bg-red-100 border-red-300 text-red-800',
  config: 'bg-blue-100 border-blue-300 text-blue-800'
};

const typeLabels = {
  frequent: '🟢 Frequently Executed',
  occasional: '🟡 Occasionally Used',
  unreachable: '🔴 Unreachable/Disabled',
  config: '🔵 Configuration'
};

export default function CoveragePage() {
  const [filter, setFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'type' | 'directory'>('type');

  const filteredFiles = filter === 'all' 
    ? repoStructure 
    : repoStructure.filter(f => f.type === filter);

  const groupedFiles = groupBy === 'type' 
    ? Object.entries(
        filteredFiles.reduce((acc, file) => {
          if (!acc[file.type]) acc[file.type] = [];
          acc[file.type].push(file);
          return acc;
        }, {} as Record<string, FileInfo[]>)
      )
    : Object.entries(
        filteredFiles.reduce((acc, file) => {
          const dir = file.path.split('/').slice(0, -1).join('/') || 'root';
          if (!acc[dir]) acc[dir] = [];
          acc[dir].push(file);
          return acc;
        }, {} as Record<string, FileInfo[]>)
      );

  const stats = {
    frequent: repoStructure.filter(f => f.type === 'frequent').length,
    occasional: repoStructure.filter(f => f.type === 'occasional').length,
    unreachable: repoStructure.filter(f => f.type === 'unreachable').length,
    config: repoStructure.filter(f => f.type === 'config').length,
    total: repoStructure.length
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Code Coverage Map</h1>
          <p className="text-muted-foreground">
            Repository execution analysis based on user flows and system usage
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.frequent}</div>
              <div className="text-xs text-muted-foreground">Frequent</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.occasional}</div>
              <div className="text-xs text-muted-foreground">Occasional</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.unreachable}</div>
              <div className="text-xs text-muted-foreground">Unreachable</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.config}</div>
              <div className="text-xs text-muted-foreground">Config</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Files</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Type:</label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'frequent' ? 'default' : 'outline'}
                    onClick={() => setFilter('frequent')}
                    className="text-green-700"
                  >
                    🟢 Frequent
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'occasional' ? 'default' : 'outline'}
                    onClick={() => setFilter('occasional')}
                    className="text-yellow-700"
                  >
                    🟡 Occasional
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'unreachable' ? 'default' : 'outline'}
                    onClick={() => setFilter('unreachable')}
                    className="text-red-700"
                  >
                    🔴 Unreachable
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'config' ? 'default' : 'outline'}
                    onClick={() => setFilter('config')}
                    className="text-blue-700"
                  >
                    🔵 Config
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Group by:</label>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={groupBy === 'type' ? 'default' : 'outline'}
                    onClick={() => setGroupBy('type')}
                  >
                    Type
                  </Button>
                  <Button 
                    size="sm" 
                    variant={groupBy === 'directory' ? 'default' : 'outline'}
                    onClick={() => setGroupBy('directory')}
                  >
                    Directory
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Listing */}
        <div className="space-y-6">
          {groupedFiles.map(([groupName, files]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {groupBy === 'type' ? typeLabels[groupName as keyof typeof typeLabels] || groupName : groupName}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({files.length} files)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${typeColors[file.type]}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm font-medium truncate">
                            {file.path}
                          </div>
                          <div className="text-sm mt-1">
                            {file.description}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                            {file.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                <span className="text-sm">Frequently executed in core user flows</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span className="text-sm">Occasionally used (admin, research, etc.)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                <span className="text-sm">Unreachable or disabled features</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
                <span className="text-sm">Configuration and build files</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}