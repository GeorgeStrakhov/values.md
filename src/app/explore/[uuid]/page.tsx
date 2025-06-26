'use client';

import { useEffect, use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useProgress } from '@/components/progress-context';
import { useDilemmaStore } from '@/store/dilemma-store';


export default function ExplorePage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { setProgress, hideProgress } = useProgress();
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  
  // Zustand store
  const {
    dilemmas,
    currentIndex,
    selectedOption,
    reasoning,
    perceivedDifficulty,
    getCurrentDilemma,
    getCurrentDilemmaId,
    getProgress,
    setDilemmas,
    setSelectedOption,
    setReasoning,
    setPerceivedDifficulty,
    goToNext,
    goToPrevious,
    restoreResponseForIndex
  } = useDilemmaStore();
  
  const loading = dilemmas.length === 0;
  const currentDilemma = getCurrentDilemma();

  // Load dilemmas on mount or when UUID changes
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        const response = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        const data = await response.json();
        setDilemmas(data.dilemmas, resolvedParams.uuid);
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
      }
    };
    
    // Only fetch if we don't have dilemmas or if starting UUID doesn't match current
    if (dilemmas.length === 0 || !dilemmas.some(d => d.dilemmaId === resolvedParams.uuid)) {
      fetchDilemmas();
    } else {
      // We have dilemmas, just update the current index to match the URL
      const targetIndex = dilemmas.findIndex(d => d.dilemmaId === resolvedParams.uuid);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        setDilemmas(dilemmas, resolvedParams.uuid);
        restoreResponseForIndex(targetIndex);
      }
    }
  }, [resolvedParams.uuid, dilemmas, currentIndex, setDilemmas, restoreResponseForIndex]);

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

  // Define handleNext before using it in useEffect
  const handleNext = useCallback(async () => {
    if (!selectedOption) return;

    const hasNext = await goToNext();
    
    if (hasNext) {
      // Update URL to current dilemma without page reload
      const newDilemmaId = getCurrentDilemmaId();
      if (newDilemmaId) {
        router.push(`/explore/${newDilemmaId}`, { scroll: false });
      }
    } else {
      // All dilemmas completed, responses submitted to database, go to results
      router.push('/results');
    }
  }, [selectedOption, goToNext, getCurrentDilemmaId, router]);

  // Auto-progression timer when user selects an option
  useEffect(() => {
    if (selectedOption && !autoNextCountdown) {
      // Start 3-second countdown for auto-progression
      setAutoNextCountdown(3);
      const interval = setInterval(() => {
        setAutoNextCountdown((prev: number | null) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Check if option is still selected before auto-advancing
            if (selectedOption) {
              handleNext().catch(console.error); // Auto-advance with error handling
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (!selectedOption) {
      // Clear countdown if user deselects
      setAutoNextCountdown(null);
    }
  }, [selectedOption, autoNextCountdown, handleNext]);

  // Reset countdown when moving to new dilemma
  useEffect(() => {
    setAutoNextCountdown(null);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      goToPrevious();
      
      // Update URL to current dilemma without page reload
      const newDilemmaId = getCurrentDilemmaId();
      if (newDilemmaId) {
        router.push(`/explore/${newDilemmaId}`, { scroll: false });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ethical dilemmas...</p>
        </div>
      </div>
    );
  }

  if (!loading && !currentDilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading dilemmas. Please try again.</p>
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
            </div>
            <CardTitle className="text-3xl mb-4">
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
              >
                Previous
              </Button>
              
              <div className="flex flex-col items-center gap-2">
                {autoNextCountdown && (
                  <div className="text-sm text-muted-foreground">
                    Auto-advancing in {autoNextCountdown}s... 
                    <button 
                      onClick={() => setAutoNextCountdown(null)}
                      className="ml-1 text-primary underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!selectedOption}
                >
                  {currentIndex === dilemmas.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}