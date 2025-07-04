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
  const [showPrivacyChoice, setShowPrivacyChoice] = useState(false);
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

  const handleGenerateClick = () => {
    setShowPrivacyChoice(true);
  };

  const generateValuesPrivate = async () => {
    if (responses.length === 0) {
      setError('No responses found. Please complete the dilemmas first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Generate values using ONLY localStorage data (no database storage)
      const valuesResponse = await fetch('/api/generate-values-private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });
      
      if (!valuesResponse.ok) {
        throw new Error(`Failed to generate values: ${valuesResponse.status}`);
      }
      
      const data = await valuesResponse.json();
      setValuesMarkdown(data.valuesMarkdown);
    } catch (err) {
      console.error('Private values generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate values');
    } finally {
      setLoading(false);
    }
  };

  const generateValuesWithDataSharing = async () => {
    if (responses.length === 0) {
      setError('No responses found. Please complete the dilemmas first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const sessionId = `session-${Date.now()}`;
      
      // Save responses to database for research
      const saveResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save responses: ${saveResponse.status}`);
      }
      
      // Generate values using database analysis
      const valuesResponse = await fetch('/api/generate-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
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
    router.push('/api/dilemmas/random');
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

        {!valuesMarkdown && !showPrivacyChoice ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Generate Your Values Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Ready to analyze your responses and create your personalized VALUES.md file?
              </p>
              <Button
                onClick={handleGenerateClick}
                disabled={loading || responses.length === 0}
                size="lg"
              >
                Generate Your VALUES.md
              </Button>
            </CardContent>
          </Card>
        ) : showPrivacyChoice && !valuesMarkdown ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>🔒 Choose Your Privacy Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                How would you like your VALUES.md file generated?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      🔒 Private Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-green-700 mb-4">
                      <li>✅ Your data stays on your device</li>
                      <li>✅ No database storage</li>
                      <li>✅ Full VALUES.md analysis</li>
                      <li>✅ Same quality results</li>
                    </ul>
                    <Button 
                      onClick={generateValuesPrivate}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Generate Privately
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      📊 Support Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-blue-700 mb-4">
                      <li>✅ Same VALUES.md quality</li>
                      <li>✅ Anonymous data contribution</li>
                      <li>✅ Help improve the platform</li>
                      <li>✅ Support ethics research</li>
                    </ul>
                    <Button 
                      onClick={generateValuesWithDataSharing}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Generate & Contribute
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <strong>Both options provide identical VALUES.md quality.</strong> The only difference is whether your anonymous responses are stored to help improve the platform for future users.
              </div>
              
              <Button 
                onClick={() => setShowPrivacyChoice(false)}
                variant="outline"
                size="sm"
              >
                ← Back
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

            {/* Next Steps */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">🎯 What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 mb-6">
                  Your VALUES.md file is ready! Here's how to put it to work and explore further:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">🔬 Test Your Values</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• <a href="/integration" className="underline hover:text-blue-900">Try the browser bookmarklet</a> with ChatGPT, Claude, or Gemini</li>
                      <li>• <a href="/proof-of-concept" className="underline hover:text-blue-900">See side-by-side AI comparisons</a> with/without your values</li>
                      <li>• <a href="/feedback" className="underline hover:text-blue-900">Share your results</a> - did VALUES.md actually change AI behavior?</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">📊 Explore Further</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• Answer more dilemmas to <a href="/api/dilemmas/random" className="underline hover:text-blue-900">refine your profile</a></li>
                      <li>• <a href="/waterfall" className="underline hover:text-blue-900">Analyze your response patterns</a> (admin)</li>
                      <li>• Learn <a href="/about" className="underline hover:text-blue-900">how the ethical framework works</a></li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={downloadValues} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    📥 Download VALUES.md
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="/integration">🔧 Test with AI</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="/proof-of-concept">🔬 See Examples</a>
                  </Button>
                  <Button onClick={startOver} variant="ghost">
                    🔄 Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}