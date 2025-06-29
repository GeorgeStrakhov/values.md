import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FormatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">VALUES.md File Format</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A standardized format for expressing personal values and ethical frameworks for AI systems
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Format Specification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The VALUES.md format provides a standardized way to express personal ethical frameworks 
                that AI systems can understand and apply consistently.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-mono text-sm font-semibold mb-2">Required Structure:</h4>
                <pre className="text-sm text-muted-foreground">
{`# VALUES.md

## Core Ethical Framework: [Framework Name]

### Primary Values
- **Value 1**: Description
- **Value 2**: Description

### Decision-Making Principles
#### Category 1
- Principle description
- Implementation guidance

### Application Guidelines
**In AI Systems:**
- Specific AI behavior guidelines

**In Policy Decisions:**
- Policy application guidelines`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Core Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Core Ethical Framework</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifies the primary ethical tradition (e.g., Consequentialist, Deontological, Virtue Ethics, Care Ethics)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Primary Values</h4>
                  <p className="text-sm text-muted-foreground">
                    Lists 3-6 core values with clear, actionable descriptions
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Decision-Making Principles</h4>
                  <p className="text-sm text-muted-foreground">
                    Organized by domain (Individual Rights, Collective Action, Technology, etc.)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Application Guidelines</h4>
                  <p className="text-sm text-muted-foreground">
                    Specific instructions for AI systems and policy decisions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation for AI Systems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>AI systems should parse VALUES.md files and:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Auto-discovery</strong>: Look for VALUES.md in user directories</li>
                <li><strong>System prompt integration</strong>: Include values in system prompts</li>
                <li><strong>Decision weighting</strong>: Apply value priorities to choices</li>
                <li><strong>Conflict resolution</strong>: Use specified frameworks for trade-offs</li>
                <li><strong>Transparency</strong>: Explain decisions in terms of stated values</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Required Elements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Core Ethical Framework declaration</li>
                    <li>• At least 3 Primary Values</li>
                    <li>• Decision-Making Principles section</li>
                    <li>• Application Guidelines for AI</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use clear, actionable language</li>
                    <li>• Provide specific examples</li>
                    <li>• Address value conflicts explicitly</li>
                    <li>• Include cultural context when relevant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}