'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValuesResult {
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  topMotifs: string[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<ValuesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateValues();
  }, []);

  const generateValues = async () => {
    try {
      // Debug all localStorage keys first
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Get data from Zustand store persistence
      const stored = localStorage.getItem('dilemma-session');
      console.log('Raw localStorage dilemma-session:', stored);
      
      if (!stored) {
        setError('No localStorage data found. Keys: ' + Object.keys(localStorage).join(', '));
        setLoading(false);
        return;
      }

      const localData = JSON.parse(stored);
      console.log('Parsed data structure:', localData);
      
      // Zustand v5 persistence format can be different
      // Try multiple format possibilities
      let stateData, sessionId, responses;
      
      if (localData.state) {
        // Format: {state: {...}, version: 0}
        stateData = localData.state;
      } else if (localData.responses && localData.sessionId) {
        // Direct format: {responses: [...], sessionId: "...", ...}
        stateData = localData;
      } else {
        console.error('Unknown data format:', localData);
        setError(`Unknown data format. Keys: ${Object.keys(localData).join(',')}`);
        setLoading(false);
        return;
      }
      
      sessionId = stateData.sessionId;
      responses = stateData.responses;
      
      console.log('Extracted data:', { 
        hasState: !!localData.state, 
        sessionId, 
        responseCount: responses?.length || 0,
        allKeys: Object.keys(stateData || {}),
        firstResponse: responses?.[0]
      });
      
      // Validate we have responses
      if (!responses || responses.length === 0) {
        setError(`No responses found. SessionId: ${sessionId}, Keys: ${Object.keys(stateData || {}).join(',')}, ResponseCount: ${responses?.length || 0}`);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/generate-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate values');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error generating values:', error);
      setError('Failed to generate your values. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadValuesFile = () => {
    if (!results) return;
    
    const blob = new Blob([results.valuesMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'values.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your values...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button 
            onClick={() => {
              console.log('=== FULL DEBUG ===');
              console.log('All localStorage:', localStorage);
              Object.keys(localStorage).forEach(key => {
                console.log(`${key}:`, localStorage.getItem(key));
              });
              console.log('=== END DEBUG ===');
            }}
            variant="secondary"
          >
            Debug localStorage
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/dilemmas/random">Start Over</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Values Profile</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Motif Analysis */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Moral Framework</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results && Object.entries(results.motifAnalysis)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([motif, count]) => (
                    <div key={motif} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{motif}</span>
                      <Badge variant="default">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Values Markdown Preview */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Values.md File</h2>
              <div className="bg-muted p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {results?.valuesMarkdown}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={downloadValuesFile}>
                Download values.md
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contribute">Contribute to Research</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/explore">Take Another Round</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">How to Use Your Values.md</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <p>• Include this file in your AI system prompts to guide decision-making</p>
              <p>• Share it with AI assistants when working on ethical decisions</p>
              <p>• Use it as a personal reference for your own moral reasoning</p>
              <p>• Update it over time as your values evolve</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}