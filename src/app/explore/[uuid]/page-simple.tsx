'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExplorePage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // Simple local state - no Zustand complexity
  const [dilemmas, setDilemmas] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);

  const currentDilemma = dilemmas[currentIndex];

  // Load dilemmas
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        console.log('Fetching dilemmas for UUID:', resolvedParams.uuid);
        const response = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        const data = await response.json();
        console.log('Fetched dilemmas:', data);
        setDilemmas(data.dilemmas || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
        setLoading(false);
      }
    };
    
    fetchDilemmas();
  }, [resolvedParams.uuid]);

  // Simple next handler - no async complexity
  const handleNext = () => {
    console.log('handleNext called', { selectedOption, currentIndex, totalDilemmas: dilemmas.length });
    
    if (!selectedOption) {
      console.log('No option selected');
      return;
    }

    if (currentIndex < dilemmas.length - 1) {
      const nextIndex = currentIndex + 1;
      console.log(`Moving from ${currentIndex} to ${nextIndex}`);
      setCurrentIndex(nextIndex);
      setSelectedOption('');
      
      // Navigate to next dilemma
      const nextDilemma = dilemmas[nextIndex];
      if (nextDilemma) {
        console.log('Navigating to:', nextDilemma.dilemmaId);
        router.push(`/explore/${nextDilemma.dilemmaId}`);
      }
    } else {
      console.log('Last dilemma, going to results');
      router.push('/results');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedOption('');
      
      const prevDilemma = dilemmas[prevIndex];
      if (prevDilemma) {
        router.push(`/explore/${prevDilemma.dilemmaId}`);
      }
    }
  };

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

  if (!currentDilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">No dilemma found. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Simple progress indicator */}
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {dilemmas.length}
          </p>
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
                    onChange={(e) => {
                      console.log('Option selected:', e.target.value);
                      setSelectedOption(e.target.value);
                    }}
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

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                className="bg-primary text-primary-foreground"
              >
                {currentIndex === dilemmas.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}