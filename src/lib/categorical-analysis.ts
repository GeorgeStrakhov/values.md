/**
 * Categorical Analysis of Code Structure
 * 
 * Implements actual category theory to analyze the mathematical structure
 * of our codebase and identify real inconsistencies.
 */

import fs from 'fs';
import path from 'path';

// Category Theory Definitions

interface Category<Obj, Mor> {
  objects: Set<Obj>;
  morphisms: Set<Mor>;
  source: (mor: Mor) => Obj;
  target: (mor: Mor) => Obj;
  identity: (obj: Obj) => Mor;
  compose: (f: Mor, g: Mor) => Mor | null; // null if not composable
}

interface Functor<ObjA, MorA, ObjB, MorB> {
  mapObject: (obj: ObjA) => ObjB;
  mapMorphism: (mor: MorA) => MorB;
  // Must preserve: F(id_A) = id_F(A) and F(g ∘ f) = F(g) ∘ F(f)
}

interface NaturalTransformation<ObjA, MorA, ObjB, MorB> {
  component: (obj: ObjA) => MorB;
  // Must satisfy naturality: η_B ∘ F(f) = G(f) ∘ η_A
}

// Base Category: Executing Code
interface CodeFunction {
  name: string;
  filePath: string;
  signature: string;
  dependencies: string[];
  behavior: 'pure' | 'io' | 'stateful' | 'render';
}

interface CodeMorphism {
  from: CodeFunction;
  to: CodeFunction;
  type: 'calls' | 'imports' | 'composes' | 'renders';
}

// Fiber Categories
interface TestCase {
  name: string;
  filePath: string;
  testedFunctions: string[];
  assertions: string[];
}

interface TestMorphism {
  from: TestCase;
  to: TestCase;
  type: 'depends' | 'mocks' | 'extends';
}

interface ArchComponent {
  name: string;
  type: 'page' | 'component' | 'hook' | 'api' | 'util';
  children: string[];
  implements: string[];
}

interface ArchMorphism {
  from: ArchComponent;
  to: ArchComponent;
  type: 'contains' | 'uses' | 'implements';
}

// The Categorical Analysis System
export class CategoricalCodeAnalyzer {
  private projectRoot: string;
  private codeCategory: Category<CodeFunction, CodeMorphism> | null = null;
  private testCategory: Category<TestCase, TestMorphism> | null = null;
  private archCategory: Category<ArchComponent, ArchMorphism> | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  // Extract the base category of executing code
  async extractCodeCategory(): Promise<Category<CodeFunction, CodeMorphism>> {
    const functions = new Set<CodeFunction>();
    const morphisms = new Set<CodeMorphism>();
    const functionsByName = new Map<string, CodeFunction>();

    // Scan source files
    const srcPath = path.join(this.projectRoot, 'src');
    await this.scanDirectory(srcPath, (filePath, content) => {
      const extracted = this.extractFunctionsFromFile(filePath, content);
      extracted.forEach(func => {
        functions.add(func);
        functionsByName.set(func.name, func);
      });
    });

    // Extract morphisms (function calls, imports)
    for (const func of functions) {
      const filePath = path.join(this.projectRoot, func.filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Find function calls
      func.dependencies.forEach(depName => {
        const targetFunc = functionsByName.get(depName);
        if (targetFunc) {
          morphisms.add({
            from: func,
            to: targetFunc,
            type: 'calls'
          });
        }
      });

      // Find imports
      const imports = this.extractImports(content);
      imports.forEach(importName => {
        const targetFunc = functionsByName.get(importName);
        if (targetFunc) {
          morphisms.add({
            from: func,
            to: targetFunc,
            type: 'imports'
          });
        }
      });
    }

    this.codeCategory = {
      objects: functions,
      morphisms,
      source: (mor) => mor.from,
      target: (mor) => mor.to,
      identity: (obj) => ({ from: obj, to: obj, type: 'calls' }),
      compose: (f, g) => {
        // f: A → B, g: B → C, compose to g ∘ f: A → C
        if (this.target(f).name !== this.source(g).name) return null;
        return {
          from: this.source(f),
          to: this.target(g),
          type: 'composes'
        };
      }
    };

    return this.codeCategory;
  }

  // Extract test category
  async extractTestCategory(): Promise<Category<TestCase, TestMorphism>> {
    const testCases = new Set<TestCase>();
    const morphisms = new Set<TestMorphism>();

    const testsPath = path.join(this.projectRoot, 'tests');
    if (fs.existsSync(testsPath)) {
      await this.scanDirectory(testsPath, (filePath, content) => {
        const extracted = this.extractTestsFromFile(filePath, content);
        extracted.forEach(test => testCases.add(test));
      });
    }

    // Extract test dependencies and relationships
    for (const test of testCases) {
      const filePath = path.join(this.projectRoot, test.filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Find test dependencies (setup, mocks, etc.)
      const dependencies = this.extractTestDependencies(content);
      dependencies.forEach(depName => {
        const targetTest = Array.from(testCases).find(t => t.name === depName);
        if (targetTest) {
          morphisms.add({
            from: test,
            to: targetTest,
            type: 'depends'
          });
        }
      });
    }

    this.testCategory = {
      objects: testCases,
      morphisms,
      source: (mor) => mor.from,
      target: (mor) => mor.to,
      identity: (obj) => ({ from: obj, to: obj, type: 'depends' }),
      compose: (f, g) => {
        if (this.target(f).name !== this.source(g).name) return null;
        return {
          from: this.source(f),
          to: this.target(g),
          type: 'extends'
        };
      }
    };

    return this.testCategory;
  }

  // Extract architectural category
  async extractArchCategory(): Promise<Category<ArchComponent, ArchMorphism>> {
    const components = new Set<ArchComponent>();
    const morphisms = new Set<ArchMorphism>();

    const srcPath = path.join(this.projectRoot, 'src');
    await this.scanDirectory(srcPath, (filePath, content) => {
      const component = this.extractComponentFromFile(filePath, content);
      if (component) components.add(component);
    });

    // Extract architectural relationships
    for (const comp of components) {
      comp.children.forEach(childName => {
        const childComp = Array.from(components).find(c => c.name === childName);
        if (childComp) {
          morphisms.add({
            from: comp,
            to: childComp,
            type: 'contains'
          });
        }
      });
    }

    this.archCategory = {
      objects: components,
      morphisms,
      source: (mor) => mor.from,
      target: (mor) => mor.to,
      identity: (obj) => ({ from: obj, to: obj, type: 'contains' }),
      compose: (f, g) => {
        if (this.target(f).name !== this.source(g).name) return null;
        return {
          from: this.source(f),
          to: this.target(g),
          type: 'implements'
        };
      }
    };

    return this.archCategory;
  }

  // Define the projection functors (structure maps of the fibration)
  createTestProjectionFunctor(): Functor<TestCase, TestMorphism, CodeFunction, CodeMorphism> {
    const functor = {
      mapObject: (test: TestCase) => {
        // Find the primary function this test covers
        if (!this.codeCategory) throw new Error('Code category not extracted');
        
        // Try to find a function this test actually tests
        for (const testedFunc of test.testedFunctions) {
          const func = Array.from(this.codeCategory.objects).find(f => f.name === testedFunc);
          if (func) return func;
        }
        
        // If no exact match, create a placeholder function to maintain categorical structure
        const placeholderFunc: CodeFunction = {
          name: `missing_${test.testedFunctions[0] || 'unknown'}`,
          filePath: test.filePath,
          signature: 'missing function',
          dependencies: [],
          behavior: 'pure'
        };
        
        return placeholderFunc;
      },
      mapMorphism: (testMor: TestMorphism) => {
        if (!this.codeCategory) throw new Error('Code category not extracted');
        
        const sourceFunc = functor.mapObject(testMor.from);
        const targetFunc = functor.mapObject(testMor.to);
        
        // Find corresponding morphism in code category
        const codeMor = Array.from(this.codeCategory.morphisms).find(m => 
          m.from.name === sourceFunc.name && m.to.name === targetFunc.name
        );
        
        if (!codeMor) {
          // Create placeholder morphism to maintain categorical structure
          return {
            from: sourceFunc,
            to: targetFunc,
            type: 'calls'
          };
        }
        
        return codeMor;
      }
    };
    return functor;
  }

  createArchProjectionFunctor(): Functor<ArchComponent, ArchMorphism, CodeFunction, CodeMorphism> {
    const functor = {
      mapObject: (comp: ArchComponent) => {
        if (!this.codeCategory) throw new Error('Code category not extracted');
        
        // Try to find a function this component implements
        for (const impl of comp.implements) {
          const func = Array.from(this.codeCategory.objects).find(f => f.name === impl);
          if (func) return func;
        }
        
        // Create placeholder function to maintain categorical structure
        const placeholderFunc: CodeFunction = {
          name: `missing_${comp.implements[0] || comp.name}`,
          filePath: '/src/components/' + comp.name,
          signature: 'missing implementation',
          dependencies: [],
          behavior: 'render'
        };
        
        return placeholderFunc;
      },
      mapMorphism: (archMor: ArchMorphism) => {
        if (!this.codeCategory) throw new Error('Code category not extracted');
        
        const sourceFunc = functor.mapObject(archMor.from);
        const targetFunc = functor.mapObject(archMor.to);
        
        const codeMor = Array.from(this.codeCategory.morphisms).find(m => 
          m.from.name === sourceFunc.name && m.to.name === targetFunc.name
        );
        
        if (!codeMor) {
          // Create placeholder morphism
          return {
            from: sourceFunc,
            to: targetFunc,
            type: 'calls'
          };
        }
        
        return codeMor;
      }
    };
    return functor;
  }

  // Verify functoriality (the mathematical laws)
  verifyFunctoriality<ObjA, MorA, ObjB, MorB>(
    categoryA: Category<ObjA, MorA>,
    categoryB: Category<ObjB, MorB>,
    functor: Functor<ObjA, MorA, ObjB, MorB>
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Law 1: Functor preserves identities
    // F(id_A) = id_F(A)
    for (const obj of categoryA.objects) {
      const idA = categoryA.identity(obj);
      const FidA = functor.mapMorphism(idA);
      const Fobj = functor.mapObject(obj);
      const idFA = categoryB.identity(Fobj);
      
      if (FidA.from.name !== idFA.from.name || FidA.to.name !== idFA.to.name) {
        violations.push(`Functor violates identity preservation: F(id_${obj}) ≠ id_F(${obj})`);
      }
    }

    // Law 2: Functor preserves composition
    // F(g ∘ f) = F(g) ∘ F(f)
    for (const f of categoryA.morphisms) {
      for (const g of categoryA.morphisms) {
        if (categoryA.source(g).name === categoryA.target(f).name) {
          const composed = categoryA.compose(f, g);
          if (composed) {
            const Fcomposed = functor.mapMorphism(composed);
            const Ff = functor.mapMorphism(f);
            const Fg = functor.mapMorphism(g);
            const FgFf = categoryB.compose(Ff, Fg);
            
            if (!FgFf || Fcomposed.from.name !== FgFf.from.name || Fcomposed.to.name !== FgFf.to.name) {
              violations.push(`Functor violates composition: F(${g} ∘ ${f}) ≠ F(${g}) ∘ F(${f})`);
            }
          }
        }
      }
    }

    return { valid: violations.length === 0, violations };
  }

  // Run complete categorical analysis
  async performCategoricalAnalysis(): Promise<{
    categories: {
      code: number;
      test: number;
      arch: number;
    };
    functoriality: {
      testProjection: { valid: boolean; violations: string[] };
      archProjection: { valid: boolean; violations: string[] };
    };
    fibrationCoherence: { valid: boolean; issues: string[] };
  }> {
    const codeCategory = await this.extractCodeCategory();
    const testCategory = await this.extractTestCategory();
    const archCategory = await this.extractArchCategory();

    const testProjection = this.createTestProjectionFunctor();
    const archProjection = this.createArchProjectionFunctor();

    const testFunctoriality = this.verifyFunctoriality(testCategory, codeCategory, testProjection);
    const archFunctoriality = this.verifyFunctoriality(archCategory, codeCategory, archProjection);

    const fibrationCoherence = this.verifyFibrationCoherence();

    return {
      categories: {
        code: codeCategory.objects.size,
        test: testCategory.objects.size,
        arch: archCategory.objects.size
      },
      functoriality: {
        testProjection: testFunctoriality,
        archProjection: archFunctoriality
      },
      fibrationCoherence
    };
  }

  // Verify the fibration property
  private verifyFibrationCoherence(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.codeCategory || !this.testCategory || !this.archCategory) {
      issues.push('Not all categories extracted');
      return { valid: false, issues };
    }

    // Check for missing function references in tests (structural nonconformity)
    const actualFunctions = new Set(Array.from(this.codeCategory.objects).map(f => f.name));
    for (const test of this.testCategory.objects) {
      for (const testedFunc of test.testedFunctions) {
        if (!actualFunctions.has(testedFunc) && !testedFunc.startsWith('missing_')) {
          issues.push(`Test "${test.name}" references non-existent function "${testedFunc}"`);
        }
      }
    }

    // Check for architectural components referencing missing implementations
    for (const comp of this.archCategory.objects) {
      for (const impl of comp.implements) {
        if (!actualFunctions.has(impl) && !impl.startsWith('missing_')) {
          issues.push(`Component "${comp.name}" claims to implement non-existent function "${impl}"`);
        }
      }
    }

    // Check for code functions without tests (coverage gaps)
    const testedFunctions = new Set<string>();
    for (const test of this.testCategory.objects) {
      test.testedFunctions.forEach(fn => testedFunctions.add(fn));
    }

    for (const func of this.codeCategory.objects) {
      if (func.behavior === 'stateful' || func.behavior === 'io') {
        if (!testedFunctions.has(func.name)) {
          issues.push(`Critical function ${func.name} (${func.behavior}) has no test coverage`);
        }
      }
    }

    // Check for orphaned tests (tests without corresponding implementation)
    const orphanedTests = Array.from(this.testCategory.objects).filter(test => 
      test.testedFunctions.every(fn => !actualFunctions.has(fn))
    );
    
    for (const test of orphanedTests) {
      issues.push(`Orphaned test "${test.name}" - no corresponding implementation found`);
    }

    // Check for broken morphisms (calls to non-existent functions)
    let brokenMorphismCount = 0;
    for (const morphism of this.codeCategory.morphisms) {
      if (morphism.from.name.startsWith('missing_') || morphism.to.name.startsWith('missing_')) {
        brokenMorphismCount++;
      }
    }
    
    if (brokenMorphismCount > 0) {
      issues.push(`${brokenMorphismCount} broken morphisms detected in code category`);
    }

    return { valid: issues.length === 0, issues };
  }

  // Helper methods for parsing code
  private async scanDirectory(dir: string, callback: (filePath: string, content: string) => void): Promise<void> {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath, callback);
      } else if (file.match(/\.(ts|tsx)$/)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        callback(fullPath.replace(this.projectRoot, ''), content);
      }
    }
  }

  private extractFunctionsFromFile(filePath: string, content: string): CodeFunction[] {
    const functions: CodeFunction[] = [];
    
    // Extract function declarations (simplified regex parsing)
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
    const arrowFunctionRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>/g;
    const methodRegex = /(\w+)\s*\([^)]*\)\s*[:{]/g;

    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        filePath,
        signature: match[0],
        dependencies: this.extractDependencies(content, match[1]),
        behavior: this.determineBehavior(content, match[1])
      });
    }

    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        filePath,
        signature: match[0],
        dependencies: this.extractDependencies(content, match[1]),
        behavior: this.determineBehavior(content, match[1])
      });
    }

    return functions;
  }

  private extractTestsFromFile(filePath: string, content: string): TestCase[] {
    const tests: TestCase[] = [];
    const testRegex = /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = testRegex.exec(content)) !== null) {
      tests.push({
        name: match[1],
        filePath,
        testedFunctions: this.extractTestedFunctions(content),
        assertions: this.extractAssertions(content)
      });
    }

    return tests;
  }

  private extractComponentFromFile(filePath: string, content: string): ArchComponent | null {
    const componentName = path.basename(filePath, path.extname(filePath));
    
    return {
      name: componentName,
      type: this.determineComponentType(filePath),
      children: this.extractComponentChildren(content),
      implements: this.extractImplementedFunctions(content)
    };
  }

  private extractDependencies(content: string, functionName: string): string[] {
    // Extract function calls that are likely dependencies
    const deps: string[] = [];
    const callRegex = /(?:await\s+)?(\w+)\s*\(/g;
    const systemKeywords = [
      'console', 'return', 'throw', 'typeof', 'instanceof', 'delete', 'void',
      'Math', 'Object', 'Array', 'JSON', 'Date', 'Promise', 'Error', 'RegExp',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      'require', 'module', 'exports', 'process', 'Buffer', 'global'
    ];
    
    let match;
    while ((match = callRegex.exec(content)) !== null) {
      const funcName = match[1];
      if (funcName !== functionName && 
          !systemKeywords.includes(funcName) &&
          funcName.length > 2 &&
          /^[a-zA-Z][a-zA-Z0-9]*$/.test(funcName)) {
        deps.push(funcName);
      }
    }
    
    return [...new Set(deps)];
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:\{([^}]+)\}|\w+)\s+from/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        const namedImports = match[1].split(',').map(s => s.trim());
        imports.push(...namedImports);
      }
    }
    
    return imports;
  }

  private determineBehavior(content: string, functionName: string): 'pure' | 'io' | 'stateful' | 'render' {
    if (content.includes('useState') || content.includes('setState')) return 'stateful';
    if (content.includes('fetch') || content.includes('db.') || content.includes('fs.')) return 'io';
    if (content.includes('return <') || content.includes('jsx')) return 'render';
    return 'pure';
  }

  private extractTestedFunctions(content: string): string[] {
    // Focus only on imports from our application - these are the functions being tested
    const functions: string[] = [];
    
    // Look for imports from our application (relative paths or @/ paths)
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[2];
      // Only include imports from our application (not node_modules or test frameworks)
      if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
        const importedNames = match[1].split(',').map(s => s.trim());
        functions.push(...importedNames);
      }
    }
    
    // Look for default imports from our application
    const defaultImportRegex = /import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
    let defaultMatch;
    
    while ((defaultMatch = defaultImportRegex.exec(content)) !== null) {
      const importPath = defaultMatch[2];
      if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
        functions.push(defaultMatch[1]);
      }
    }
    
    return [...new Set(functions)];
  }

  private extractAssertions(content: string): string[] {
    const assertions: string[] = [];
    const expectRegex = /expect\([^)]+\)\.([^(]+)/g;
    let match;
    
    while ((match = expectRegex.exec(content)) !== null) {
      assertions.push(match[1]);
    }
    
    return assertions;
  }

  private extractTestDependencies(content: string): string[] {
    // Look for setup functions, mocks, etc.
    const deps: string[] = [];
    const setupRegex = /(?:beforeEach|beforeAll|jest\.mock)\s*\(\s*['"`]?([^'"`\)]+)/g;
    let match;
    
    while ((match = setupRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    return deps;
  }

  private determineComponentType(filePath: string): 'page' | 'component' | 'hook' | 'api' | 'util' {
    if (filePath.includes('/app/') && filePath.endsWith('page.tsx')) return 'page';
    if (filePath.includes('/api/')) return 'api';
    if (filePath.includes('/hooks/') || path.basename(filePath).startsWith('use')) return 'hook';
    if (filePath.includes('/components/')) return 'component';
    return 'util';
  }

  private extractComponentChildren(content: string): string[] {
    // Look for component usage
    const children: string[] = [];
    const componentRegex = /<(\w+)[\s>]/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      if (match[1][0] === match[1][0].toUpperCase()) { // Component names start with uppercase
        children.push(match[1]);
      }
    }
    
    return [...new Set(children)];
  }

  private extractImplementedFunctions(content: string): string[] {
    // Functions exported from this file
    const functions: string[] = [];
    const exportRegex = /export\s+(?:const|function)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    return functions;
  }

}