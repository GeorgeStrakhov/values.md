'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ResultsPageContent() {
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
      router.push('/');
    }
  }, [router]);

  // Simple private generation (default recommended path)
  const generateSimple = async () => {
    if (responses.length === 0) {
      setError('No responses found. Please complete the dilemmas first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const valuesResponse = await fetch('/api/generate-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: crypto.randomUUID(), responses })
      });
      
      if (!valuesResponse.ok) {
        throw new Error(`Failed to generate values: ${valuesResponse.status}`);
      }
      
      const data = await valuesResponse.json();
      setValuesMarkdown(data.valuesMarkdown);
      localStorage.setItem('generated-values', data.valuesMarkdown);
    } catch (err) {
      console.error('Values generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate values');
    } finally {
      setLoading(false);
    }
  };

  // Generate with research contribution
  const generateWithResearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const sessionId = crypto.randomUUID();
      
      // Save to database for research
      const saveResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, sessionId })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save responses: ${saveResponse.status}`);
      }
      
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
      localStorage.setItem('generated-values', data.valuesMarkdown);
    } catch (err) {
      console.error('Values generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate values');
    } finally {
      setLoading(false);
    }
  };

  // Experimental LLM generation
  const generateExperimental = async () => {
    setLoading(true);
    setError('');
    
    try {
      const sessionId = crypto.randomUUID();
      
      const saveResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, sessionId })
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save responses: ${saveResponse.status}`);
      }
      
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
      localStorage.setItem('generated-values', data.valuesMarkdown);
    } catch (err) {
      console.error('LLM values generation error:', err);
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

  const shareWithResearch = async () => {
    try {
      const sessionId = crypto.randomUUID();
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, sessionId })
      });
      
      if (response.ok) {
        alert('Thank you! Your anonymous data has been shared with researchers to improve ethical AI systems.');
      } else {
        alert('Failed to share data. Please try again later.');
      }
    } catch (error) {
      alert('Failed to share data. Please try again later.');
    }
  };

  const startOver = () => {
    localStorage.removeItem('responses');
    localStorage.removeItem('demographics');
    localStorage.removeItem('session_id');
    localStorage.removeItem('dilemma_responses');
    localStorage.removeItem('user_session');
    localStorage.removeItem('dilemma-session');
    router.push('/start');
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
          // PROGRESSIVE DISCLOSURE: Simple start
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Generate Your VALUES.md</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Ready to create your personalized VALUES.md file?
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={generateSimple}
                  disabled={loading || responses.length === 0}
                  size="lg"
                  className="text-lg px-8 py-4 w-full"
                >
                  Generate My VALUES.md
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  🔒 Your data stays private on your device
                </p>
              </div>
            </CardContent>
          </Card>
        ) : showOptions && !valuesMarkdown ? (
          // PROGRESSIVE DISCLOSURE: Options revealed
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Choose Your Privacy Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                How would you like to generate your VALUES.md?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50 hover:border-green-300 transition-colors">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-green-800 mb-2">🔒 Keep Private</h4>
                    <p className="text-sm text-green-700 mb-4">Your data stays on your device only</p>
                    <Button
                      onClick={generateSimple}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Generate Privately
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Help Research</h4>
                    <p className="text-sm text-blue-700 mb-4">Anonymous contribution to ethics research</p>
                    <Button
                      onClick={generateWithResearch}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Generate & Contribute
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Progressive disclosure: advanced options */}
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-muted-foreground"
                >
                  {showAdvanced ? 'Hide' : 'Show'} experimental options 
                  {showAdvanced ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </Button>
                
                {showAdvanced && (
                  <Card className="mt-4 border-gray-200 bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600">🧪 Experimental</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500 mb-3">
                        Advanced AI analysis (experimental, requires research contribution)
                      </p>
                      <Button
                        variant="outline"
                        onClick={generateExperimental}
                        disabled={loading}
                        className="w-full"
                      >
                        Generate with AI Analysis
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => setShowOptions(false)}
                  className="mt-3"
                >
                  ← Back to simple option
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Results display - also simplified
          <div className="space-y-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">🎉 Your VALUES.md is Ready!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Your personalized VALUES.md file has been generated based on your {responses.length} responses.
                </p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={downloadValues}
                    size="lg"
                    className="w-full text-lg"
                  >
                    📥 Download VALUES.md
                  </Button>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3">
                      🔬 <strong>Help improve ethical AI research</strong><br/>
                      Share your anonymous responses to help researchers understand how people reason about ethical dilemmas.
                    </p>
                    <Button
                      onClick={shareWithResearch}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Share Anonymous Data for Research
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={startOver}
                    >
                      Start Over
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/')}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VALUES.md preview - collapsed by default */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your VALUES.md File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
                  <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {valuesMarkdown}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <ResultsPageContent />;
}