/**
 * Fibration Layer Consistency Checker
 * 
 * Implements the mathematical fibration structure where:
 * Base: Executing code reality
 * Fibers: Progressive abstraction layers (performance, tests, architecture, concepts)
 * 
 * Verifies that higher abstraction layers are derivable from and consistent with
 * lower layers, maintaining topological coherence across the development stack.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Base Category: Executing Code Reality
interface ExecutingCode {
  functionName: string;
  filePath: string;
  executionTrace?: PerformanceEntry[];
  actualBehavior: 'renders' | 'computes' | 'persists' | 'transforms';
}

// Fiber Layer 1: Performance/Flamechart Data
interface PerformanceLayer {
  executionTraces: Map<string, PerformanceEntry[]>;
  componentRenderTimes: Map<string, number>;
  databaseQueryDurations: Map<string, number>;
  userInteractionLatencies: Map<string, number>;
}

// Fiber Layer 2: Test Coverage Data  
interface TestLayer {
  testFiles: string[];
  coverageMap: Map<string, number>; // file -> coverage percentage
  testResults: Map<string, 'pass' | 'fail' | 'skip'>;
  testToCodeMapping: Map<string, string[]>; // test -> covered files
}

// Fiber Layer 3: Architectural Structure
interface ArchitecturalLayer {
  componentTree: ComponentNode[];
  dataFlowGraph: DataFlow[];
  systemBoundaries: SystemBoundary[];
  dependencyGraph: Map<string, string[]>;
}

// Fiber Layer 4: Conceptual/Project Map
interface ConceptualLayer {
  userJourneys: UserJourney[];
  systemPurpose: string;
  featureMap: FeatureDescription[];
  projectDecomposition: ConceptualModel;
}

interface ComponentNode {
  name: string;
  path: string;
  children: ComponentNode[];
  type: 'page' | 'component' | 'hook' | 'util' | 'api';
}

interface DataFlow {
  from: string;
  to: string;
  dataType: string;
  transformationType: 'query' | 'mutation' | 'computation' | 'render';
}

interface SystemBoundary {
  name: string;
  components: string[];
  purpose: string;
}

interface UserJourney {
  name: string;
  steps: string[];
  implementingComponents: string[];
}

interface FeatureDescription {
  name: string;
  purpose: string;
  implementingFiles: string[];
  testFiles: string[];
}

interface ConceptualModel {
  name: string;
  description: string;
  subModels: ConceptualModel[];
}

// Fibration Consistency Checker
export class FibrationChecker {
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  // Extract executing code reality (Base Category)
  async extractExecutingCode(): Promise<ExecutingCode[]> {
    const srcPath = path.join(this.projectRoot, 'src');
    const codeFiles: ExecutingCode[] = [];
    
    const scanDirectory = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Extract function signatures (simplified AST parsing)
          const functionMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=|(\w+):\s*\([^)]*\)\s*=>/g);
          
          if (functionMatches) {
            functionMatches.forEach(match => {
              const functionName = match.match(/(\w+)/)?.[1] || 'anonymous';
              
              // Determine behavior type from context
              let behavior: ExecutingCode['actualBehavior'] = 'computes';
              if (content.includes('return <') || content.includes('jsx')) behavior = 'renders';
              if (content.includes('db.') || content.includes('INSERT') || content.includes('UPDATE')) behavior = 'persists';
              if (content.includes('useState') || content.includes('useEffect')) behavior = 'transforms';
              
              codeFiles.push({
                functionName,
                filePath: fullPath.replace(this.projectRoot, ''),
                actualBehavior: behavior
              });
            });
          }
        }
      }
    };
    
    scanDirectory(srcPath);
    return codeFiles;
  }

  // Extract Layer 1: Performance Data
  async extractPerformanceLayer(): Promise<PerformanceLayer> {
    // This would integrate with actual performance monitoring
    // For now, simulate based on file analysis
    const codeFiles = await this.extractExecutingCode();
    
    const layer: PerformanceLayer = {
      executionTraces: new Map(),
      componentRenderTimes: new Map(),
      databaseQueryDurations: new Map(),
      userInteractionLatencies: new Map()
    };
    
    // Analyze files for performance characteristics
    for (const code of codeFiles) {
      const fullPath = path.join(this.projectRoot, code.filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Estimate performance based on code complexity
      const complexity = content.length / 100; // Rough heuristic
      
      switch (code.actualBehavior) {
        case 'renders':
          layer.componentRenderTimes.set(code.functionName, complexity);
          break;
        case 'persists':
          layer.databaseQueryDurations.set(code.functionName, complexity * 2);
          break;
        case 'transforms':
          layer.userInteractionLatencies.set(code.functionName, complexity * 0.5);
          break;
      }
    }
    
    return layer;
  }

  // Extract Layer 2: Test Coverage
  async extractTestLayer(): Promise<TestLayer> {
    const testsPath = path.join(this.projectRoot, 'tests');
    
    const layer: TestLayer = {
      testFiles: [],
      coverageMap: new Map(),
      testResults: new Map(),
      testToCodeMapping: new Map()
    };
    
    // Scan test files
    if (fs.existsSync(testsPath)) {
      const testFiles = fs.readdirSync(testsPath).filter(f => f.endsWith('.test.ts'));
      layer.testFiles = testFiles;
      
      // Analyze each test file
      testFiles.forEach(testFile => {
        const content = fs.readFileSync(path.join(testsPath, testFile), 'utf-8');
        
        // Extract what code this test covers (simplified)
        const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g);
        const coveredFiles = importMatches?.map(match => {
          const path = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
          return path?.replace('@/', 'src/') || '';
        }).filter(Boolean) || [];
        
        layer.testToCodeMapping.set(testFile, coveredFiles);
        
        // Estimate coverage based on test content
        const testCount = (content.match(/it\(/g) || []).length;
        const estimatedCoverage = Math.min(100, testCount * 15); // Rough heuristic
        
        coveredFiles.forEach(file => {
          layer.coverageMap.set(file, estimatedCoverage);
        });
      });
    }
    
    return layer;
  }

  // Extract Layer 3: Architecture
  async extractArchitecturalLayer(): Promise<ArchitecturalLayer> {
    const srcPath = path.join(this.projectRoot, 'src');
    
    const layer: ArchitecturalLayer = {
      componentTree: [],
      dataFlowGraph: [],
      systemBoundaries: [],
      dependencyGraph: new Map()
    };
    
    // Build component tree
    const buildComponentTree = (dir: string, relativePath: string = ''): ComponentNode[] => {
      const nodes: ComponentNode[] = [];
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const currentPath = path.join(relativePath, file);
        
        if (stat.isDirectory()) {
          const node: ComponentNode = {
            name: file,
            path: currentPath,
            children: buildComponentTree(fullPath, currentPath),
            type: this.determineComponentType(file, fullPath)
          };
          nodes.push(node);
        } else if (file.match(/\.(ts|tsx)$/)) {
          const node: ComponentNode = {
            name: file.replace(/\.(ts|tsx)$/, ''),
            path: currentPath,
            children: [],
            type: this.determineComponentType(file, fullPath)
          };
          nodes.push(node);
        }
      }
      
      return nodes;
    };
    
    layer.componentTree = buildComponentTree(srcPath);
    
    // Analyze data flows and dependencies
    const analyzeFile = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const dependencies: string[] = [];
      
      // Extract imports
      const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const dep = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
          if (dep && !dep.startsWith('.') && !dep.startsWith('@/')) {
            dependencies.push(dep);
          }
        });
      }
      
      layer.dependencyGraph.set(filePath, dependencies);
    };
    
    // Scan all source files for dependencies
    this.walkDirectory(srcPath, analyzeFile);
    
    return layer;
  }

  // Extract Layer 4: Conceptual Model
  async extractConceptualLayer(): Promise<ConceptualLayer> {
    const layer: ConceptualLayer = {
      userJourneys: [],
      systemPurpose: '',
      featureMap: [],
      projectDecomposition: { name: 'Root', description: '', subModels: [] }
    };
    
    // Extract from documentation files
    const readmeFiles = [
      'README.md',
      'CLAUDE.md', 
      'SYSTEMATIC_COMPLETION_MAP.md',
      'CONCEPT_TREE.md'
    ];
    
    readmeFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract user journeys from documentation
        const journeyMatches = content.match(/(?:User|Journey|Flow):\s*(.+)/gi);
        if (journeyMatches) {
          journeyMatches.forEach((match, i) => {
            layer.userJourneys.push({
              name: `Journey ${i + 1}`,
              steps: [match.replace(/^[^:]+:\s*/, '')],
              implementingComponents: [] // Would need deeper analysis
            });
          });
        }
        
        // Extract system purpose
        if (content.includes('## Overview') || content.includes('# Overview')) {
          const overviewMatch = content.match(/##?\s*Overview\s*\n\n([^#]+)/);
          if (overviewMatch) {
            layer.systemPurpose = overviewMatch[1].trim();
          }
        }
      }
    });
    
    return layer;
  }

  // Consistency Verification Functions
  
  async verifyLayerConsistency(): Promise<{
    performance: boolean;
    tests: boolean;
    architecture: boolean;
    concepts: boolean;
    issues: string[];
  }> {
    const executingCode = await this.extractExecutingCode();
    const performanceLayer = await this.extractPerformanceLayer();
    const testLayer = await this.extractTestLayer();
    const architecturalLayer = await this.extractArchitecturalLayer();
    const conceptualLayer = await this.extractConceptualLayer();
    
    const issues: string[] = [];
    
    // Verify Performance Layer Consistency
    const performanceConsistent = this.verifyPerformanceConsistency(
      executingCode, performanceLayer, issues
    );
    
    // Verify Test Layer Consistency  
    const testsConsistent = this.verifyTestConsistency(
      executingCode, testLayer, issues
    );
    
    // Verify Architectural Consistency
    const architectureConsistent = this.verifyArchitecturalConsistency(
      executingCode, architecturalLayer, issues
    );
    
    // Verify Conceptual Consistency
    const conceptsConsistent = this.verifyConceptualConsistency(
      architecturalLayer, conceptualLayer, issues
    );
    
    return {
      performance: performanceConsistent,
      tests: testsConsistent,
      architecture: architectureConsistent,
      concepts: conceptsConsistent,
      issues
    };
  }

  private verifyPerformanceConsistency(
    code: ExecutingCode[], 
    performance: PerformanceLayer,
    issues: string[]
  ): boolean {
    let consistent = true;
    
    // Check that all executing functions have performance data
    for (const func of code) {
      const hasPerformanceData = 
        performance.componentRenderTimes.has(func.functionName) ||
        performance.databaseQueryDurations.has(func.functionName) ||
        performance.userInteractionLatencies.has(func.functionName);
        
      if (!hasPerformanceData) {
        issues.push(`Function ${func.functionName} missing performance data`);
        consistent = false;
      }
    }
    
    return consistent;
  }

  private verifyTestConsistency(
    code: ExecutingCode[],
    tests: TestLayer,
    issues: string[]
  ): boolean {
    let consistent = true;
    
    // Check that critical functions are tested
    for (const func of code) {
      if (func.actualBehavior === 'persists' || func.actualBehavior === 'transforms') {
        const isTested = Array.from(tests.testToCodeMapping.values())
          .some(files => files.some(file => file.includes(func.filePath)));
          
        if (!isTested) {
          issues.push(`Critical function ${func.functionName} not tested`);
          consistent = false;
        }
      }
    }
    
    return consistent;
  }

  private verifyArchitecturalConsistency(
    code: ExecutingCode[],
    architecture: ArchitecturalLayer,
    issues: string[]
  ): boolean {
    let consistent = true;
    
    // Check that all code files are represented in component tree
    for (const func of code) {
      const isInArchitecture = this.findInComponentTree(
        architecture.componentTree, func.filePath
      );
      
      if (!isInArchitecture) {
        issues.push(`Code file ${func.filePath} not in architecture model`);
        consistent = false;
      }
    }
    
    return consistent;
  }

  private verifyConceptualConsistency(
    architecture: ArchitecturalLayer,
    concepts: ConceptualLayer,
    issues: string[]
  ): boolean {
    let consistent = true;
    
    // Check that user journeys map to architectural components
    for (const journey of concepts.userJourneys) {
      if (journey.implementingComponents.length === 0) {
        issues.push(`User journey "${journey.name}" has no implementing components`);
        consistent = false;
      }
    }
    
    return consistent;
  }

  // Helper Methods
  
  private determineComponentType(name: string, fullPath: string): ComponentNode['type'] {
    if (name.includes('page') || fullPath.includes('/app/')) return 'page';
    if (name.includes('api') || fullPath.includes('/api/')) return 'api';
    if (name.startsWith('use')) return 'hook';
    if (fullPath.includes('/components/')) return 'component';
    return 'util';
  }

  private walkDirectory(dir: string, callback: (filePath: string) => void) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(fullPath, callback);
      } else if (file.match(/\.(ts|tsx)$/)) {
        callback(fullPath);
      }
    }
  }

  private findInComponentTree(tree: ComponentNode[], filePath: string): boolean {
    for (const node of tree) {
      if (node.path.includes(filePath) || filePath.includes(node.path)) {
        return true;
      }
      if (this.findInComponentTree(node.children, filePath)) {
        return true;
      }
    }
    return false;
  }

  // Derivation Functions
  
  async deriveTestsFromPerformance(performance: PerformanceLayer): Promise<string[]> {
    const derivedTests: string[] = [];
    
    // Derive performance tests from slow operations
    for (const [component, time] of performance.componentRenderTimes) {
      if (time > 50) { // Threshold for slow renders
        derivedTests.push(
          `it('should render ${component} within acceptable time', () => {\n` +
          `  expect(renderTime).toBeLessThan(50);\n` +
          `});`
        );
      }
    }
    
    for (const [query, duration] of performance.databaseQueryDurations) {
      if (duration > 100) { // Threshold for slow queries
        derivedTests.push(
          `it('should execute ${query} query quickly', () => {\n` +
          `  expect(queryDuration).toBeLessThan(100);\n` +
          `});`
        );
      }
    }
    
    return derivedTests;
  }

  async deriveArchitectureFromCode(code: ExecutingCode[]): Promise<string> {
    // Generate Mermaid diagram from code structure
    const components = code.reduce((acc, func) => {
      const dir = path.dirname(func.filePath);
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(func.functionName);
      return acc;
    }, {} as Record<string, string[]>);
    
    let mermaid = 'graph TB\n';
    
    Object.entries(components).forEach(([dir, functions]) => {
      mermaid += `  subgraph ${dir.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
      functions.forEach(func => {
        mermaid += `    ${func}\n`;
      });
      mermaid += `  end\n`;
    });
    
    return mermaid;
  }
}

// Export verification function for use in health checks
export async function verifyFibrationConsistency(projectRoot?: string) {
  const checker = new FibrationChecker(projectRoot);
  return await checker.verifyLayerConsistency();
}