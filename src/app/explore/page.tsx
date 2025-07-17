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
  const [choice, setChoice] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dilemmas once
  useEffect(() => {
    fetch('/api/dilemmas')
      .then(res => res.json())
      .then(data => {
        setDilemmas(data.dilemmas || []);
        setStartTime(Date.now());
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dilemmas');
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    if (!choice) return;
    
    const responseTime = Date.now() - startTime;
    const newResponse: Response = {
      dilemmaId: dilemmas[currentIndex].dilemmaId,
      chosenOption: choice,
      reasoning,
      responseTime,
      perceivedDifficulty: difficulty
    };
    
    const updatedResponses = [...responses, newResponse];
    
    if (currentIndex === dilemmas.length - 1) {
      // Flow complete - redirect to results
      const data = btoa(JSON.stringify(updatedResponses));
      router.push(`/results?data=${data}`);
    } else {
      // Next dilemma
      setResponses(updatedResponses);
      setCurrentIndex(currentIndex + 1);
      setChoice('');
      setReasoning('');
      setDifficulty(5);
      setStartTime(Date.now());
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dilemmas...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!dilemmas.length) return <div className="p-8 text-center">No dilemmas available</div>;

  const current = dilemmas[currentIndex];
  const progress = ((currentIndex + 1) / dilemmas.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Question {currentIndex + 1} of {dilemmas.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <Badge variant="secondary">{current.domain}</Badge>
          <CardTitle className="text-2xl">{current.title}</CardTitle>
          <p className="text-muted-foreground">{current.scenario}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
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