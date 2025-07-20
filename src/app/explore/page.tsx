'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useClientOnly } from '@/hooks/use-client-only';
import { storage } from '@/lib/storage';
import { apiClient } from '@/lib/api-client';
import { ROUTES, type Dilemma, type UserResponse } from '@/lib/constants';

export default function ExplorePage() {
  const router = useRouter();
  
  // BULLETPROOF STATE - no SSR issues, no hydration mismatches
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [startTime, setStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  // SSR-safe client-only hook
  const isClient = useClientOnly(true, false);

  // Load dilemmas and initialize session (client-only)
  useEffect(() => {
    if (!isClient) return;
    
    const initializeSession = async () => {
      try {
        // Check if already completed
        if (storage.isComplete()) {
          router.push(ROUTES.RESULTS);
          return;
        }
        
        // Load dilemmas from bulletproof API client
        const dilemmalist = await apiClient.getDilemmas();
        
        if (dilemmalist.length === 0) {
          setError('No dilemmas available. Please try again later.');
          setLoading(false);
          return;
        }
        
        setDilemmas(dilemmalist);
        setSessionId(storage.generateSessionId());
        setStartTime(Date.now());
        setLoading(false);
        
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setError('Failed to load dilemmas. Please refresh the page.');
        setLoading(false);
      }
    };
    
    initializeSession();
  }, [isClient, router]);

  // BULLETPROOF response handler - no race conditions, no errors
  const handleNext = async () => {
    if (!choice || !isClient) return;
    
    const responseTime = Date.now() - startTime;
    const newResponse: UserResponse = {
      dilemmaId: dilemmas[currentIndex].dilemmaId,
      chosenOption: choice,
      reasoning: reasoning || '',
      responseTime,
      perceivedDifficulty: difficulty
    };
    
    // ATOMIC STORAGE OPERATION - single source of truth
    const success = storage.addResponse(newResponse);
    if (!success) {
      setError('Failed to save your response. Please try again.');
      return;
    }
    
    // Update local state
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    
    // Non-blocking research data save
    apiClient.saveResponses(sessionId, [newResponse]).catch(() => {
      // Silent failure - localStorage is primary
    });
    
    // Check completion
    if (currentIndex === dilemmas.length - 1 || storage.isComplete()) {
      // Navigate to results - storage handles the completion state
      router.push(ROUTES.RESULTS);
      return;
    }
    
    // Next dilemma - reset form state
    setCurrentIndex(currentIndex + 1);
    setChoice('');
    setReasoning('');
    setDifficulty(5);
    setStartTime(Date.now());
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
          <p className="text-muted-foreground">Loading dilemmas...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!dilemmas.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No dilemmas available</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const current = dilemmas[currentIndex];
  const progress = ((currentIndex + 1) / dilemmas.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Question {currentIndex + 1} of {dilemmas.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Dilemma */}
      <Card className="mb-8">
        <CardHeader>
          <Badge variant="secondary">{current.domain}</Badge>
          <CardTitle className="text-2xl">{current.title}</CardTitle>
          <p className="text-muted-foreground">{current.scenario}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Choices */}
          <div>
            <Label className="text-lg font-semibold">What would you choose?</Label>
            <div className="grid gap-3 mt-4">
              {[
                { id: 'A', text: current.choiceA },
                { id: 'B', text: current.choiceB },
                { id: 'C', text: current.choiceC },
                { id: 'D', text: current.choiceD }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setChoice(option.id)}
                  className={`p-4 text-left border-2 rounded-lg transition-colors ${
                    choice === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="font-bold text-blue-600">{option.id}.</span> {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <Label htmlFor="reasoning">Your reasoning (optional)</Label>
            <Textarea
              id="reasoning"
              placeholder="Explain your choice..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Difficulty */}
          <div>
            <Label>Difficulty: {difficulty}/10</Label>
            <Slider
              value={[difficulty]}
              onValueChange={(value) => setDifficulty(value[0])}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!choice}
        >
          {currentIndex === dilemmas.length - 1 ? 'Generate VALUES.md' : 'Next'}
        </Button>
      </div>
    </div>
  );
}