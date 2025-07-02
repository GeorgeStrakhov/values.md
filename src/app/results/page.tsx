'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResultsPage() {
  const [responses, setResponses] = useState([]);
  const [valuesMarkdown, setValuesMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('responses');
    if (stored) {
      setResponses(JSON.parse(stored));
    } else {
      // No responses found, redirect to start
      router.push('/');
    }
  }, [router]);

  const generateValues = async () => {
    if (responses.length === 0) {
      setError('No responses found. Please complete the dilemmas first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const sessionId = `session-${Date.now()}`;
      
      // Save responses to database
      const saveResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save responses: ${saveResponse.status}`);
      }
      
      // Generate values
      const valuesResponse = await fetch(`/api/generate-values?sessionId=${sessionId}`);
      if (!valuesResponse.ok) {
        throw new Error(`Failed to generate values: ${valuesResponse.status}`);
      }
      
      const data = await valuesResponse.json();
      setValuesMarkdown(data.valuesMarkdown);
    } catch (err) {
      console.error('Values generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate values');
    } finally {
      setLoading(false);
    }
  };

  const downloadValues = () => {
    const blob = new Blob([valuesMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'values.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    localStorage.removeItem('responses');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Analyzing Your Values</h2>
            <p className="text-muted-foreground">
              Processing your {responses.length} responses...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Results</h1>
          <p className="text-lg text-muted-foreground">
            You answered {responses.length} ethical dilemmas
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {!valuesMarkdown ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Generate Your Values Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Ready to analyze your responses and create your personalized VALUES.md file?
              </p>
              <Button
                onClick={generateValues}
                disabled={loading || responses.length === 0}
                size="lg"
              >
                {loading ? 'Generating...' : 'Generate Your VALUES.md'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📋</span>
                  Your Personal VALUES.md File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {valuesMarkdown}
                </pre>
              </CardContent>
            </Card>

            <div className="text-center space-x-4">
              <Button onClick={downloadValues} size="lg">
                Download VALUES.md
              </Button>
              <Button onClick={startOver} variant="outline">
                Start Over
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}