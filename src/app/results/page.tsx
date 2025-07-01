'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessionManagement, withSessionProtection } from '@/hooks/use-session-management';
import { useEnhancedDilemmaStore } from '@/store/enhanced-dilemma-store';

interface ValuesResult {
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  detailedAnalysis: Array<{
    motifId: string;
    name: string;
    category: string;
    count: number;
    weight: number;
  }>;
  frameworkAlignment: Array<{
    framework: string;
    score: number;
  }>;
  domainPreferences: Record<string, number>;
}

function ResultsPageContent() {
  const session = useSessionManagement({ debug: true });
  
  const {
    appState,
    valuesMarkdown,
    error,
    responses,
    sessionId,
    generateValues,
    hasCompleteResponses,
    reset
  } = useEnhancedDilemmaStore();
  
  const [results, setResults] = useState<ValuesResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>('');

  // Generate values when component mounts if needed
  useEffect(() => {
    if (!session.isInitialized) return;
    
    // If we already have values markdown, parse it
    if (valuesMarkdown) {
      try {
        // For now, just display the markdown as-is
        // TODO: Parse into structured format if needed
        setResults({
          valuesMarkdown,
          motifAnalysis: {},
          detailedAnalysis: [],
          frameworkAlignment: [],
          domainPreferences: {}
        });
      } catch (error) {
        console.error('Error parsing existing values:', error);
      }
      return;
    }
    
    // If we have complete responses but no values, generate them
    if (hasCompleteResponses && !valuesMarkdown && appState !== 'generating') {
      handleGenerateValues();
    }
  }, [session.isInitialized, valuesMarkdown, hasCompleteResponses, appState]);

  const handleGenerateValues = async () => {
    if (!hasCompleteResponses) {
      setGenerationError('Please complete all dilemmas before generating values.');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');
    
    try {
      console.log('🎯 Generating values for session:', sessionId);
      console.log('📊 Responses count:', responses.length);
      
      const success = await generateValues();
      
      if (success && valuesMarkdown) {
        setResults({
          valuesMarkdown,
          motifAnalysis: {},
          detailedAnalysis: [],
          frameworkAlignment: [],
          domainPreferences: {}
        });
      } else {
        throw new Error('Values generation failed');
      }
    } catch (error) {
      console.error('❌ Values generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    reset();
    session.navigateToRoute('/');
  };

  // Show error state
  if (appState === 'error' || generationError) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive mb-4">
                Generation Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {error || generationError || 'Unable to generate your values profile.'}
              </p>
              <div className="space-x-4">
                <Button onClick={handleGenerateValues} disabled={isGenerating}>
                  {isGenerating ? 'Retrying...' : 'Try Again'}
                </Button>
                <Button variant="outline" onClick={handleStartOver}>
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show generating state
  if (appState === 'generating' || isGenerating || !results) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8">
            <CardContent>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-4">Analyzing Your Values</h2>
              <p className="text-muted-foreground mb-4">
                We're processing your {responses.length} responses to create your personalized values profile...
              </p>
              <div className="text-sm text-muted-foreground">
                Session: {sessionId}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Values Profile</h1>
          <p className="text-lg text-muted-foreground">
            Based on your responses to {responses.length} ethical dilemmas
          </p>
        </div>

        {/* Values Markdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span>
              Your Personal Values.md File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {results.valuesMarkdown}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Session ID</div>
                <div className="font-mono text-sm">{sessionId}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Responses</div>
                <div>{responses.length} dilemmas completed</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant="secondary">{session.sessionStatus}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-x-4">
          <Button onClick={handleStartOver} variant="outline">
            Start New Session
          </Button>
          <Link href="/about">
            <Button variant="secondary">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Debug Info */}
        {session.debug && (
          <Card className="mt-8 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify({
                  appState,
                  sessionStatus: session.sessionStatus,
                  hasValidSession: session.hasValidSession,
                  hasCompleteResponses: session.hasCompleteResponses,
                  responsesCount: responses.length,
                  hasValuesMarkdown: !!valuesMarkdown
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Export with session protection that requires complete responses
export default withSessionProtection(ResultsPageContent, {
  requireComplete: true,
  enableAutoRedirect: true,
  restoreOnMount: true,
  debug: true
});