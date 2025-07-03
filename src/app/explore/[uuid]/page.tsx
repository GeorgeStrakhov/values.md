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
          const savedResponses = JSON.parse(stored);
          setResponses(savedResponses);
          
          // If user has completed all dilemmas, redirect to results
          if (savedResponses.length >= data.dilemmas.length) {
            console.log(`User completed ${savedResponses.length}/${data.dilemmas.length} dilemmas, redirecting to results`);
            router.push('/results');
            return;
          }
          
          // Set current index to the next dilemma to answer
          setCurrentIndex(savedResponses.length);
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
    
    const newResponses = [...responses, newResponse];
    setResponses(newResponses);
    localStorage.setItem('responses', JSON.stringify(newResponses));
    
    // Navigate to next or finish
    if (currentIndex + 1 >= dilemmas.length) {
      router.push('/results');
    } else {
      setCurrentIndex(currentIndex + 1);
      setChoice('');
      setReasoning('');
      setDifficulty(5); // Reset to default
      setStartTime(Date.now()); // Reset timer for next dilemma
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
  
  const currentDilemma = dilemmas[currentIndex];
  
  // Safety check: if no current dilemma and we have responses, go to results
  if (!currentDilemma && responses.length > 0) {
    router.push('/results');
    return null;
  }
  
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
                  router.push('/api/dilemmas/random');
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
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {dilemmas.length}
            </span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / dilemmas.length) * 100}%` }}
              />
            </div>
          </div>
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