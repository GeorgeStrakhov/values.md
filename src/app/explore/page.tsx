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

interface Dilemma {
  dilemmaId: string;
  title: string;
  scenario: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  domain: string;
}

interface Response {
  dilemmaId: string;
  chosenOption: string;
  reasoning: string;
  responseTime: number;
  perceivedDifficulty: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Current dilemma form state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Load 12 dilemmas on mount
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        const response = await fetch('/api/dilemmas/random');
        const redirectUrl = response.url;
        
        // Extract UUID from redirect URL
        const match = redirectUrl.match(/\/explore\/([^\/]+)/);
        if (match) {
          const uuid = match[1];
          const dilemmaResponse = await fetch(`/api/dilemmas/${uuid}`);
          const data = await dilemmaResponse.json();
          
          setDilemmas(data.dilemmas);
          setStartTime(Date.now());
        }
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
        setError('Failed to load dilemmas. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDilemmas();
  }, []);

  const currentDilemma = dilemmas[currentIndex];
  const isLastDilemma = currentIndex === dilemmas.length - 1;
  const progress = ((currentIndex + 1) / dilemmas.length) * 100;

  const handleNext = () => {
    if (!selectedOption) return;

    // Save current response
    const responseTime = Date.now() - startTime;
    const newResponse: Response = {
      dilemmaId: currentDilemma.dilemmaId,
      chosenOption: selectedOption,
      reasoning,
      responseTime,
      perceivedDifficulty,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (isLastDilemma) {
      // Pass responses to results page via URL params (base64 encoded)
      const encodedResponses = btoa(JSON.stringify(updatedResponses));
      router.push(`/results?data=${encodedResponses}`);
    } else {
      // Move to next dilemma
      setCurrentIndex(currentIndex + 1);
      setSelectedOption('');
      setReasoning('');
      setPerceivedDifficulty(5);
      setStartTime(Date.now());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      
      // Restore previous response if it exists
      const previousResponse = responses[currentIndex - 1];
      if (previousResponse) {
        setSelectedOption(previousResponse.chosenOption);
        setReasoning(previousResponse.reasoning);
        setPerceivedDifficulty(previousResponse.perceivedDifficulty);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!currentDilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">No dilemmas available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {dilemmas.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

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
            {/* Multiple choice options */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">What would you choose?</Label>
              <div className="grid gap-3">
                {[
                  { id: 'A', text: currentDilemma.choiceA },
                  { id: 'B', text: currentDilemma.choiceB },
                  { id: 'C', text: currentDilemma.choiceC },
                  { id: 'D', text: currentDilemma.choiceD },
                ].map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedOption(choice.id)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      selectedOption === choice.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-primary">{choice.id}.</span>
                      <span className="flex-1">{choice.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="space-y-2">
              <Label htmlFor="reasoning">Your reasoning (optional)</Label>
              <Textarea
                id="reasoning"
                placeholder="Explain your choice..."
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Difficulty rating */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                How difficult was this decision?
                <span className="text-sm text-muted-foreground">({perceivedDifficulty}/10)</span>
              </Label>
              <Slider
                value={[perceivedDifficulty]}
                onValueChange={(value) => setPerceivedDifficulty(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Easy</span>
                <span>Very Difficult</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{responses.length} of {dilemmas.length} answered</span>
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="min-w-[120px]"
          >
            {isLastDilemma ? 'Generate VALUES.md' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}