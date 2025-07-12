'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { saveResponses, loadResponses, getStorageHealth } from '@/lib/storage';
import { validateResponse, checkDataIntegrity } from '@/lib/validation';
import { trackEvent, trackResponse, trackStorageIssue, trackApiError } from '@/lib/telemetry';
import { DilemmaErrorBoundary } from '@/components/error-boundary';
import { SystemStatePanel, StateAwareButton } from '@/components/system-state';

function ExplorePageContent({ params }: { params: Promise<{ uuid: string }> }) {
  const [dilemmas, setDilemmas] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [choice, setChoice] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [pagination, setPagination] = useState({ total: 0, loaded: 0, hasMore: true });
  const [loadingMore, setLoadingMore] = useState(false);
  const [storageHealth, setStorageHealth] = useState<any>(null);
  const router = useRouter();

  // Load dilemmas once on mount
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        if (!res.ok) throw new Error('Failed to load dilemmas');
        
        const data = await res.json();
        
        // Handle validation errors or empty response
        if (!data.dilemmas || !Array.isArray(data.dilemmas) || data.dilemmas.length === 0) {
          console.error('No dilemmas in response:', data);
          throw new Error('No dilemmas available');
        }
        
        setDilemmas(data.dilemmas);
        
        // Set pagination info
        if (data.pagination) {
          setPagination(data.pagination);
        }
        
        // Check storage health
        setStorageHealth(getStorageHealth());
        
        // Restore previous responses if any
        const allSavedResponses = loadResponses();
          
        // Filter responses to only include those that match current dilemmas
        const currentDilemmaIds = new Set(data.dilemmas.map((d: any) => d.dilemmaId));
        const relevantResponses = allSavedResponses.filter((response: any) => 
          currentDilemmaIds.has(response.dilemmaId)
        );
        
        setResponses(relevantResponses);
          
        // Note: We no longer auto-redirect when all dilemmas are completed
        // Users can now choose to continue or view results
        
        // Find the next unanswered dilemma
        const answeredDilemmaIds = new Set(relevantResponses.map((r: any) => r.dilemmaId));
        const nextUnansweredIndex = data.dilemmas.findIndex((d: any) => !answeredDilemmaIds.has(d.dilemmaId));
        
        if (nextUnansweredIndex !== -1) {
          setCurrentIndex(nextUnansweredIndex);
        } else {
          // User has answered all dilemmas - show completion state
          setCurrentIndex(-1);
        }
        
        // Reset timer for current dilemma
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading dilemmas:', error);
        trackApiError('/api/dilemmas', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDilemmas();
  }, [params]);

  // Handle user's answer
  const handleNext = () => {
    if (!choice) return;
    
    const responseTime = Date.now() - startTime;
    const newResponse = {
      dilemmaId: dilemmas[currentIndex].dilemmaId,
      chosenOption: choice,
      reasoning: reasoning || '',
      responseTime: responseTime,
      perceivedDifficulty: difficulty
    };
    
    // Get existing responses from localStorage to merge with current session
    const stored = localStorage.getItem('responses');
    const existingResponses = stored ? JSON.parse(stored) : [];
    
    // Remove any existing response for this dilemma and add the new one
    const filteredResponses = existingResponses.filter((r: any) => r.dilemmaId !== newResponse.dilemmaId);
    const allResponses = [...filteredResponses, newResponse];
    
    // Validate response before saving
    const validationResult = validateResponse(newResponse);
    if (!validationResult.isValid) {
      console.warn('Invalid response detected:', validationResult.errors);
      trackApiError('/explore', { validation: validationResult.errors });
      return; // Don't save invalid responses
    }
    
    // Track response submission
    trackResponse(newResponse, validationResult);
    
    // Update both local state and secure storage
    const newResponses = [...responses, newResponse];
    setResponses(newResponses);
    
    // Use robust storage system
    const saveSuccess = saveResponses(allResponses);
    if (!saveSuccess) {
      console.warn('Failed to save responses to storage');
      trackStorageIssue('save_failed', { responseCount: allResponses.length });
      // Still continue with the flow, data is in memory
    }
    
    // Update storage health
    setStorageHealth(getStorageHealth());
    
    // Navigate to next dilemma
    const nextIndex = currentIndex + 1;
    if (nextIndex < dilemmas.length) {
      setCurrentIndex(nextIndex);
      setChoice('');
      setReasoning('');
      setDifficulty(5); // Reset to default
      setStartTime(Date.now()); // Reset timer for next dilemma
    } else {
      // User has answered all available dilemmas
      // Show completion UI instead of auto-redirecting
      setCurrentIndex(-1); // Special state to show completion options
    }
  };

  // Load more dilemmas when approaching the end
  const loadMoreDilemmas = async () => {
    if (!pagination.hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/dilemmas/${resolvedParams.uuid}?offset=${(pagination as any).nextOffset}&limit=25`);
      if (!res.ok) throw new Error('Failed to load more dilemmas');
      
      const data = await res.json();
      setDilemmas(prev => [...prev, ...data.dilemmas]);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading more dilemmas:', error);
      trackApiError('/api/dilemmas/pagination', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Auto-load more dilemmas when approaching the end
  useEffect(() => {
    if (currentIndex >= dilemmas.length - 5 && pagination.hasMore && !loadingMore) {
      loadMoreDilemmas();
    }
  }, [currentIndex, dilemmas.length, pagination.hasMore, loadingMore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dilemmas...</p>
        </div>
      </div>
    );
  }
  
  // Handle completion state (currentIndex === -1)
  if (currentIndex === -1) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">🎉 Amazing Work!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg mb-2">You&apos;ve completed all {dilemmas.length} available dilemmas!</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve answered {responses.length} ethical scenarios. 
                  This rich dataset will create a comprehensive values.md file.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Response Summary:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-2xl font-bold text-primary">{responses.length}</span>
                    <p className="text-muted-foreground">Scenarios</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(responses.reduce((sum: number, r: any) => sum + (r.responseTime || 0), 0) / responses.length / 1000)}s
                    </span>
                    <p className="text-muted-foreground">Avg. Time</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(responses.reduce((sum: number, r: any) => sum + (r.perceivedDifficulty || 5), 0) / responses.length * 10) / 10}
                    </span>
                    <p className="text-muted-foreground">Avg. Difficulty</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {responses.filter((r: any) => r.reasoning && r.reasoning.length > 0).length}
                    </span>
                    <p className="text-muted-foreground">With Reasoning</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/results')}
                  size="lg" 
                  className="w-full h-12 text-lg font-semibold"
                >
                  Generate My VALUES.md
                </Button>
                <Button 
                  onClick={() => {
                    localStorage.removeItem('responses');
                    localStorage.removeItem('demographics');
                    localStorage.removeItem('session_id');
                    localStorage.removeItem('dilemma_responses');
                    localStorage.removeItem('user_session');
                    localStorage.removeItem('dilemma-session');
                    router.push('/start');
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Start Fresh Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentDilemma = dilemmas[currentIndex];
  
  // If no current dilemma and no responses, show error
  if (!currentDilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Session Not Found</h2>
            <p className="mb-4">This dilemma session is invalid or has expired. Start a new session to continue.</p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  localStorage.removeItem('responses');
                  localStorage.removeItem('demographics');
                  localStorage.removeItem('session_id');
                  localStorage.removeItem('dilemma_responses');
                  localStorage.removeItem('user_session');
                  localStorage.removeItem('dilemma-session');
                  router.push('/start');
                }} 
                className="w-full"
              >
                Start New Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto py-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground ml-4">
                Answered: {responses.length}
              </span>
            </div>
            <div className="w-72 bg-gray-200 rounded-full h-2.5 shadow-inner">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, (responses.length / 12) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Storage health warning */}
          {storageHealth && !storageHealth.healthy && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <span className="text-yellow-800">
                ⚠️ Storage space low ({Math.round(storageHealth.usage.percentage)}% used)
              </span>
              {storageHealth.recommendations.map((rec: string, i: number) => (
                <p key={i} className="text-yellow-700 mt-1">{rec}</p>
              ))}
            </div>
          )}
          
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl leading-tight text-foreground">
              {currentDilemma.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <p className="text-lg leading-relaxed">{currentDilemma.scenario}</p>
            
            {/* Choices */}
            <div className="space-y-4">
              {[
                { key: 'a', text: currentDilemma.choiceA },
                { key: 'b', text: currentDilemma.choiceB },
                { key: 'c', text: currentDilemma.choiceC },
                { key: 'd', text: currentDilemma.choiceD }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setChoice(option.key)}
                  className={`w-full p-5 text-left border rounded-xl transition-all duration-200 ${
                    choice === option.key 
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20' 
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <span className="font-medium">{option.key.toUpperCase()})</span> {option.text}
                </button>
              ))}
            </div>
            
            {/* Reasoning */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Why did you choose this option? (optional)
              </label>
              <Textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Share your reasoning..."
                className="min-h-[100px]"
              />
            </div>
            
            {/* Difficulty Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">
                How difficult was this dilemma? ({difficulty}/10)
              </label>
              <Slider
                value={[difficulty]}
                onValueChange={([value]) => setDifficulty(value)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Very Easy</span>
                <span>Very Difficult</span>
              </div>
            </div>
            
            {/* Next button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNext}
                disabled={!choice}
                className="h-12 px-8 text-base font-semibold"
              >
                {currentIndex + 1 >= dilemmas.length ? 'Finish & See Results' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ExplorePage({ params }: { params: Promise<{ uuid: string }> }) {
  return (
    <DilemmaErrorBoundary>
      <ExplorePageContent params={params} />
    </DilemmaErrorBoundary>
  );
}