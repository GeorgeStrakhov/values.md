'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useProgress } from '@/components/progress-context';
import { useSessionManagement, withSessionProtection } from '@/hooks/use-session-management';
import { useEnhancedDilemmaStore } from '@/store/enhanced-dilemma-store';

function ExplorePage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { setProgress, hideProgress } = useProgress();
  const session = useSessionManagement({ debug: true });
  
  // Enhanced Zustand store
  const {
    dilemmas,
    currentIndex,
    selectedOption,
    reasoning,
    perceivedDifficulty,
    appState,
    isLoading,
    getCurrentDilemma,
    getProgress,
    setDilemmas,
    setCurrentIndex,
    setSelectedOption,
    setReasoning,
    setPerceivedDifficulty,
    saveCurrentResponse,
    restoreResponseForIndex,
    startNewSession,
    sendEvent
  } = useEnhancedDilemmaStore();
  
  const loading = isLoading || dilemmas.length === 0;
  const currentDilemma = getCurrentDilemma();

  // Load dilemmas on mount or when UUID changes
  useEffect(() => {
    if (!session.isInitialized) return;

    const fetchDilemmas = async () => {
      try {
        sendEvent({ type: 'START_SESSION' });
        
        const response = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch dilemmas: ${response.status}`);
        }
        
        const data = await response.json();
        setDilemmas(data.dilemmas, resolvedParams.uuid);
        
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
        sendEvent({
          type: 'DILEMMAS_LOAD_FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
    
    // Only fetch if we don't have dilemmas or if starting UUID doesn't match current
    if (dilemmas.length === 0 || !dilemmas.some(d => d.dilemmaId === resolvedParams.uuid)) {
      fetchDilemmas();
    } else {
      // Sync store to URL (URL is source of truth)
      const urlIndex = dilemmas.findIndex(d => d.dilemmaId === resolvedParams.uuid);
      if (urlIndex !== -1 && urlIndex !== currentIndex) {
        console.log('🔄 Syncing store to URL:', { urlIndex, currentIndex, uuid: resolvedParams.uuid });
        setCurrentIndex(urlIndex);
        restoreResponseForIndex(urlIndex);
      }
    }
  }, [
    session.isInitialized,
    resolvedParams.uuid,
    dilemmas,
    currentIndex,
    setDilemmas,
    setCurrentIndex,
    restoreResponseForIndex,
    sendEvent
  ]);

  // Update progress when dilemmas or index changes
  useEffect(() => {
    if (dilemmas.length > 0) {
      const progress = getProgress();
      setProgress(progress.current, progress.total);
    }
    return () => {
      hideProgress();
    };
  }, [currentIndex, dilemmas.length, setProgress, hideProgress, getProgress]);

  // Scroll to top when URL changes (direct navigation or initial load)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resolvedParams.uuid]);

  // Auto-save on selection
  useEffect(() => {
    if (selectedOption) {
      saveCurrentResponse();
    }
  }, [selectedOption, saveCurrentResponse]);

  const handleNext = async () => {
    if (!selectedOption) return;
    
    // Save current response first
    saveCurrentResponse();
    
    // Check if this is the last dilemma
    const nextIndex = currentIndex + 1;
    if (nextIndex >= dilemmas.length) {
      // Last dilemma - navigate to results (let the enhanced store handle submission)
      session.navigateToRoute('/results');
    } else {
      // Navigate to next dilemma using direct access
      const nextDilemma = dilemmas[nextIndex];
      if (nextDilemma) {
        router.push(`/explore/${nextDilemma.dilemmaId}`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevDilemma = dilemmas[prevIndex];
      if (prevDilemma) {
        router.push(`/explore/${prevDilemma.dilemmaId}`);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {appState === 'loading' ? 'Loading ethical dilemmas...' : session.statusMessage}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (appState === 'error' || (!loading && !currentDilemma)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Card className="p-6">
            <CardContent>
              <h2 className="text-xl font-bold mb-4 text-destructive">
                Unable to Load Dilemma
              </h2>
              <p className="text-muted-foreground mb-6">
                There was an error loading the dilemmas. Please try starting a new session.
              </p>
              <Button 
                onClick={() => session.navigateToRoute('/')}
                className="w-full"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentDilemma) {
    return null; // Still loading
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Dilemma card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{currentDilemma.domain}</Badge>
              {session.debug && (
                <Badge variant="outline" className="text-xs">
                  {appState}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl mb-4" data-testid="dilemma-title">
              {currentDilemma.title}
            </CardTitle>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentDilemma.scenario}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Choices */}
            <div className="space-y-4">
              {[
                { option: 'a', text: currentDilemma.choiceA },
                { option: 'b', text: currentDilemma.choiceB },
                { option: 'c', text: currentDilemma.choiceC },
                { option: 'd', text: currentDilemma.choiceD },
              ].map(({ option, text }) => (
                <label
                  key={option}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="sr-only"
                    data-testid={`choice-${option}`}
                  />
                  <div className="flex items-start space-x-3">
                    <span className="bg-muted text-muted-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                      {option.toUpperCase()}
                    </span>
                    <p className="flex-1">{text}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Difficulty rating */}
            <div className="space-y-3">
              <Label>How difficult was this dilemma to decide?</Label>
              <div className="space-y-2">
                <Slider
                  value={[perceivedDifficulty]}
                  onValueChange={(value) => setPerceivedDifficulty(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                  data-testid="difficulty-slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 - Very Easy</span>
                  <span className="font-medium">{perceivedDifficulty}/10</span>
                  <span>10 - Very Hard</span>
                </div>
              </div>
            </div>

            {/* Optional reasoning */}
            <div className="space-y-2">
              <Label htmlFor="reasoning">Optional: Explain your reasoning</Label>
              <Textarea
                id="reasoning"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why did you choose this option? (optional)"
                rows={3}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                data-testid="previous-button"
              >
                Previous
              </Button>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  data-testid="next-button"
                >
                  {currentIndex === dilemmas.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {session.debug && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify({
                  appState,
                  sessionStatus: session.sessionStatus,
                  currentIndex,
                  dilemmasCount: dilemmas.length,
                  hasValidSession: session.hasValidSession,
                  selectedOption,
                  uuid: resolvedParams.uuid
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Export with session protection
export default withSessionProtection(ExplorePage, {
  enableAutoRedirect: true,
  restoreOnMount: true,
  debug: true
});