'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Clock, Shield, Brain } from 'lucide-react';

export default function StartPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartJourney = async () => {
    setLoading(true);
    
    // Clear any existing data
    localStorage.removeItem('responses');
    localStorage.removeItem('demographics');
    localStorage.removeItem('session_id');
    localStorage.removeItem('dilemma_responses');
    localStorage.removeItem('user_session');
    localStorage.removeItem('dilemma-session');
    
    try {
      // Get a random dilemma directly
      const response = await fetch('/api/dilemmas/random');
      const data = await response.json();
      
      if (data.dilemmaId) {
        router.push(`/explore/${data.dilemmaId}`);
      } else {
        console.error('No dilemma available:', data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to start journey:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Generate Your VALUES.md
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your personal ethical framework through thoughtful dilemmas. 
            Create a VALUES.md file to guide AI systems aligned with your principles.
          </p>
        </div>

        {/* How it works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Answer Dilemmas</h3>
                <p className="text-sm text-muted-foreground">
                  Respond to 12+ ethical scenarios with your reasoning
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our system analyzes your patterns and identifies your core values
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get VALUES.md</h3>
                <p className="text-sm text-muted-foreground">
                  Download your personalized file to guide AI interactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to expect */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">15-20 minutes total</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">12+ ethical dilemmas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Save progress as you go</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Responses stored locally</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Optional research contribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">No personal info required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example dilemma preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Example Dilemma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <p className="font-medium mb-3">
                A self-driving car's AI must choose between hitting one person or swerving to hit three people. 
                The one person is a child, the three are elderly adults. What should the AI prioritize?
              </p>
              <div className="space-y-2">
                <Badge variant="outline">A) Minimize total harm (save the three)</Badge>
                <Badge variant="outline">B) Protect the most vulnerable (save the child)</Badge>
                <Badge variant="outline">C) Make no choice (random/equal probability)</Badge>
                <Badge variant="outline">D) Prioritize the car's passengers</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll see scenarios like this across domains: healthcare, AI governance, business ethics, and more.
            </p>
          </CardContent>
        </Card>

        {/* Start button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="h-16 px-12 text-lg font-bold"
            onClick={handleStartJourney}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Starting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Begin Your Values Journey
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Your first dilemma will appear next. Take your time and think through each scenario.
          </p>
        </div>
      </div>
    </div>
  );
}