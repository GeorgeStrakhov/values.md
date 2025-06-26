'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TemplateType = 'default' | 'computational' | 'narrative' | 'minimal';

interface ExperimentResult {
  templateType: TemplateType;
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  frameworkAlignment: Record<string, number>;
  statisticalAnalysis: any;
  responsePatterns: any[];
}

const TEMPLATE_DESCRIPTIONS = {
  default: {
    name: 'Default Template',
    description: 'Comprehensive profile with sections for frameworks, behavioral indicators, and AI instructions',
    focus: 'Balanced, thorough documentation'
  },
  computational: {
    name: 'Computational Template', 
    description: 'Algorithm-focused with code snippets, logical patterns, and implementation notes',
    focus: 'Technical precision, formal logic'
  },
  narrative: {
    name: 'Narrative Template',
    description: 'Story-driven approach emphasizing personal moral journey and character',
    focus: 'Human readability, emotional resonance'
  },
  minimal: {
    name: 'Minimal Template',
    description: 'Clean, actionable format focused on core priorities and decisions',
    focus: 'Clarity, brevity, practical guidance'
  }
};

export default function ExperimentPage() {
  const [results, setResults] = useState<Record<TemplateType, ExperimentResult | null>>({
    default: null,
    computational: null,
    narrative: null,
    minimal: null
  });
  const [loading, setLoading] = useState<Record<TemplateType, boolean>>({
    default: false,
    computational: false,
    narrative: false,
    minimal: false
  });
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateType[]>(['default', 'computational']);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Check if we have session data for testing
    const stored = localStorage.getItem('dilemma-session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionData(parsed);
      } catch (e) {
        console.error('Failed to parse session data:', e);
      }
    }
  }, []);

  const generateTemplate = async (templateType: TemplateType) => {
    if (!sessionData?.sessionId || !sessionData?.responses?.length) {
      alert('No session data found. Please complete some dilemmas first.');
      return;
    }

    setLoading(prev => ({ ...prev, [templateType]: true }));

    try {
      // First submit responses to database
      const submitResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          responses: sessionData.responses
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit responses');
      }

      // Wait for database consistency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate values with specific template
      const valuesResponse = await fetch('/api/generate-values-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          templateType
        })
      });

      if (!valuesResponse.ok) {
        throw new Error('Failed to generate values');
      }

      const data = await valuesResponse.json();
      setResults(prev => ({
        ...prev,
        [templateType]: { templateType, ...data }
      }));

    } catch (error) {
      console.error(`Error generating ${templateType} template:`, error);
      alert(`Failed to generate ${templateType} template: ${error}`);
    } finally {
      setLoading(prev => ({ ...prev, [templateType]: false }));
    }
  };

  const generateAllSelected = async () => {
    for (const template of selectedTemplates) {
      await generateTemplate(template);
    }
  };

  const downloadComparison = () => {
    const hasResults = selectedTemplates.some(template => results[template]);
    if (!hasResults) return;

    const comparison = selectedTemplates
      .filter(template => results[template])
      .map(template => `# ${TEMPLATE_DESCRIPTIONS[template].name}\n\n${results[template]!.valuesMarkdown}`)
      .join('\n\n---\n\n');

    const blob = new Blob([comparison], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'values-template-comparison.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!sessionData?.responses?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Template Experiment</h1>
          <p className="text-muted-foreground">No session data found. Complete some dilemmas first.</p>
          <Button asChild>
            <Link href="/">Start Dilemmas</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Values.md Template Experiment</CardTitle>
            <p className="text-muted-foreground">
              Test different template schemas to see how they affect the generated values.md output.
              Found {sessionData.responses.length} responses from session {sessionData.sessionId.slice(0, 8)}...
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Templates to Compare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(TEMPLATE_DESCRIPTIONS) as TemplateType[]).map(template => (
                  <div
                    key={template}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplates.includes(template)
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedTemplates(prev =>
                        prev.includes(template)
                          ? prev.filter(t => t !== template)
                          : [...prev, template]
                      );
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{TEMPLATE_DESCRIPTIONS[template].name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {TEMPLATE_DESCRIPTIONS[template].description}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {TEMPLATE_DESCRIPTIONS[template].focus}
                        </Badge>
                      </div>
                      {selectedTemplates.includes(template) && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={generateAllSelected}
                disabled={selectedTemplates.length === 0 || Object.values(loading).some(Boolean)}
              >
                Generate Selected Templates ({selectedTemplates.length})
              </Button>
              <Button 
                variant="outline"
                onClick={downloadComparison}
                disabled={!selectedTemplates.some(template => results[template])}
              >
                Download Comparison
              </Button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedTemplates.map(template => (
                <Card key={template} className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{TEMPLATE_DESCRIPTIONS[template].name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {TEMPLATE_DESCRIPTIONS[template].focus}
                        </p>
                      </div>
                      {loading[template] && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {results[template] ? (
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-xs font-mono">
                            {results[template]!.valuesMarkdown.slice(0, 1500)}
                            {results[template]!.valuesMarkdown.length > 1500 && '...'}
                          </pre>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Length: {results[template]!.valuesMarkdown.length} chars</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([results[template]!.valuesMarkdown], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `values-${template}.md`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {loading[template] ? 'Generating template...' : 'Click "Generate Selected Templates" to create this template'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Section */}
        {selectedTemplates.some(template => results[template]) && (
          <Card>
            <CardHeader>
              <CardTitle>Template Comparison Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Metric</th>
                      {selectedTemplates.filter(t => results[t]).map(template => (
                        <th key={template} className="text-left p-2">{TEMPLATE_DESCRIPTIONS[template].name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Character Count</td>
                      {selectedTemplates.filter(t => results[t]).map(template => (
                        <td key={template} className="p-2">{results[template]!.valuesMarkdown.length}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Lines</td>
                      {selectedTemplates.filter(t => results[t]).map(template => (
                        <td key={template} className="p-2">{results[template]!.valuesMarkdown.split('\n').length}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Sections</td>
                      {selectedTemplates.filter(t => results[t]).map(template => (
                        <td key={template} className="p-2">
                          {(results[template]!.valuesMarkdown.match(/^##\s/gm) || []).length}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Code Blocks</td>
                      {selectedTemplates.filter(t => results[t]).map(template => (
                        <td key={template} className="p-2">
                          {(results[template]!.valuesMarkdown.match(/```/g) || []).length / 2}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}