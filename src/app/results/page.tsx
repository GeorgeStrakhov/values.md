'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientOnly } from '@/hooks/use-client-only';
import { storage } from '@/lib/storage';
import { apiClient, type ValuesResponse } from '@/lib/api-client';
import { ROUTES, type UserResponse } from '@/lib/constants';

export default function ResultsPage() {
  const [results, setResults] = useState<ValuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [responses, setResponses] = useState<UserResponse[]>([]);
  
  // SSR-safe client-only hook
  const isClient = useClientOnly(true, false);

  useEffect(() => {
    if (!isClient) return;
    
    const generateValues = async () => {
      try {
        // BULLETPROOF storage access - single source of truth
        const session = storage.getSession();
        
        if (!session || !storage.isComplete()) {
          setError('No completed responses found. Please complete the dilemmas first.');
          setLoading(false);
          return;
        }
        
        const userResponses = session.responses;
        setResponses(userResponses);
        
        if (userResponses.length < 12) {
          setError(`Only ${userResponses.length}/12 responses completed. Please finish the dilemmas first.`);
          setLoading(false);
          return;
        }
        
        // BULLETPROOF API call with proper error handling
        const valuesResult = await apiClient.generateValues(userResponses);
        
        if (!valuesResult) {
          setError('Failed to generate your values. Please try again.');
          setLoading(false);
          return;
        }
        
        setResults(valuesResult);
        
      } catch (error) {
        console.error('Error in results page:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateValues();
  }, [isClient]);

  const downloadValuesFile = () => {
    if (!results || !isClient) return;
    
    try {
      const blob = new Blob([results.valuesMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'values.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(results.valuesMarkdown);
    }
  };
  
  const startOver = () => {
    if (!isClient) return;
    storage.clear();
    window.location.href = ROUTES.EXPLORE;
  };

  // BULLETPROOF LOADING AND ERROR STATES
  if (!isClient) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
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
          <div className="flex gap-4 justify-center">
            <Button onClick={startOver} variant="outline">
              Start Over
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Values Profile</CardTitle>
            <p className="text-muted-foreground">
              Based on your responses to {responses.length} ethical dilemmas
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Values Markdown */}
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
              <Button asChild variant="outline">
                <Link href={ROUTES.RESEARCH}>Contribute to Research</Link>
              </Button>
              <Button onClick={startOver} variant="outline">
                Take Another Round
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