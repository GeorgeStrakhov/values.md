'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export default function ExplorePage({ params }) {
  const [dilemmas, setDilemmas] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [choice, setChoice] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const router = useRouter();

  // Load dilemmas once on mount
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        if (!res.ok) throw new Error('Failed to load dilemmas');
        
        const data = await res.json();
        setDilemmas(data.dilemmas);
        
        // Restore previous responses if any
        const stored = localStorage.getItem('responses');
        if (stored) {
          const allSavedResponses = JSON.parse(stored);
          
          // Filter responses to only include those that match current dilemmas
          const currentDilemmaIds = new Set(data.dilemmas.map(d => d.dilemmaId));
          const relevantResponses = allSavedResponses.filter(response => 
            currentDilemmaIds.has(response.dilemmaId)
          );
          
          setResponses(relevantResponses);
          
          // Note: We no longer auto-redirect when all dilemmas are completed
          // Users can now choose to continue or view results
          
          // Find the next unanswered dilemma
          const answeredDilemmaIds = new Set(relevantResponses.map(r => r.dilemmaId));
          const nextUnansweredIndex = data.dilemmas.findIndex(d => !answeredDilemmaIds.has(d.dilemmaId));
          
          if (nextUnansweredIndex !== -1) {
            setCurrentIndex(nextUnansweredIndex);
          } else {
            // User has answered all dilemmas - show completion state
            setCurrentIndex(-1);
          }
        }
        
        // Reset timer for current dilemma
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading dilemmas:', error);
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
    const filteredResponses = existingResponses.filter(r => r.dilemmaId !== newResponse.dilemmaId);
    const allResponses = [...filteredResponses, newResponse];
    
    // Update both local state and localStorage
    const newResponses = [...responses, newResponse];
    setResponses(newResponses);
    localStorage.setItem('responses', JSON.stringify(allResponses));
    
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
                <p className="text-lg mb-2">You've completed all {dilemmas.length} available dilemmas!</p>
                <p className="text-sm text-muted-foreground">
                  You've answered {responses.length} ethical scenarios. 
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
                      {Math.round(responses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responses.length / 1000)}s
                    </span>
                    <p className="text-muted-foreground">Avg. Time</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(responses.reduce((sum, r) => sum + (r.perceivedDifficulty || 5), 0) / responses.length * 10) / 10}
                    </span>
                    <p className="text-muted-foreground">Avg. Difficulty</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {responses.filter(r => r.reasoning && r.reasoning.length > 0).length}
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
                  onClick={() => router.push('/api/start-fresh')}
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
            <h2 className="text-xl font-bold mb-4">No Dilemmas Available</h2>
            <p className="mb-4">Unable to load dilemmas. Please try again.</p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  localStorage.removeItem('responses');
                  router.push('/api/start-fresh');
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
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {dilemmas.length}
              </span>
              <span className="text-xs text-muted-foreground ml-4">
                Answered: {responses.length}
              </span>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / dilemmas.length) * 100}%` }}
              />
            </div>
          </div>
          {responses.length >= 12 && (
            <div className="text-center">
              <p className="text-xs text-green-600 mb-1">✓ You have enough responses for a comprehensive values.md</p>
              <Button 
                onClick={() => router.push('/results')}
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Generate Values Now
              </Button>
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentDilemma.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{currentDilemma.scenario}</p>
            
            {/* Choices */}
            <div className="space-y-3">
              {[
                { key: 'a', text: currentDilemma.choiceA },
                { key: 'b', text: currentDilemma.choiceB },
                { key: 'c', text: currentDilemma.choiceC },
                { key: 'd', text: currentDilemma.choiceD }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setChoice(option.key)}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${
                    choice === option.key 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50'
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
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!choice}
                size="lg"
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