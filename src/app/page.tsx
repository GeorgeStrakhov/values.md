'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const [examples, setExamples] = useState<string[]>([]);
  const [currentExample, setCurrentExample] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const response = await fetch('/api/examples');
        const data = await response.json();
        if (data.examples) {
          setExamples(data.examples.map((ex: { content: string }) => ex.content));
          setCurrentExample(Math.floor(Math.random() * data.examples.length));
        }
      } catch (error) {
        console.error('Failed to fetch examples:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamples();
  }, []);

  const rotateExample = () => {
    if (examples.length > 1) {
      setCurrentExample((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * examples.length);
        } while (next === prev);
        return next;
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-16 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl text-foreground font-bold tracking-tight mb-4">VALUES.md</h1>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column - Project Description */}
          <div className="space-y-6 text-left">
            <div className="space-y-6 text-base lg:text-lg leading-relaxed font-medium">
              <p className="text-xl lg:text-2xl leading-relaxed text-foreground">
                As AI agents make more and more decisions autonomously on our behalf, we face a dilemma:
              </p>
              <p className="text-lg lg:text-xl leading-relaxed text-foreground/80 border-l-4 border-primary pl-4 italic">
                Should we take moral responsibility for their actions, or should we assume that the responsibility lies with those who trained the LLMs running these agents?
              </p>
              <p className="text-lg lg:text-xl leading-relaxed text-foreground/80">
                This choice is not just about our agents, but also about our own freedom. Because without responsibility, there can't be real freedom.
              </p>
              <p className="text-lg lg:text-xl leading-relaxed text-foreground">
                To help individuals, corporations and governments to take active, explicit and transparent stance on the ethical frameworks that their agents should follow, we propose a new file format called <code className="bg-muted/80 px-2 lg:px-3 py-1 rounded-md text-base lg:text-lg font-mono font-bold text-foreground">VALUES.md</code>.
              </p>
              <p className="text-base lg:text-lg leading-relaxed text-foreground/70">
                Just like <a href="https://docs.anthropic.com/en/docs/claude-code/memory" className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors" target="_blank" rel="noopener noreferrer">Claude Code uses CLAUDE.md files</a> to follow user preferences on syntax, design patterns and style, we propose that all AI agents should autodiscover <code className="bg-muted/80 px-2 py-1 rounded text-sm lg:text-base font-mono font-bold text-foreground">VALUES.md</code> specification and actively use it as part of their system prompt whenever possible.
              </p>
            </div>
          </div>

          {/* Right Column - Example VALUES.md */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-lg border-2">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg lg:text-xl font-bold">
                  Example VALUES.md
                </CardTitle>
                <Button
                  onClick={rotateExample}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-xs"
                  disabled={loading || examples.length <= 1}
                >
                  <RotateCcw className="h-3 w-3" />
                  Another Example
                </Button>
              </CardHeader>
              <CardContent className="p-3 lg:p-6">
                <div className="bg-muted/50 p-3 lg:p-6 rounded-lg border overflow-hidden">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading example...
                    </div>
                  ) : (
                    <pre className="text-xs lg:text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {examples[currentExample]}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Primary CTA */}
          <div className="space-y-4">
            <Button asChild size="lg" className="h-16 px-8 text-lg font-bold">
              <Link href="/api/dilemmas/random">
                Generate Your VALUES.md
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground font-medium">
              Discover your values through 12 ethical dilemmas
            </p>
            <p className="text-sm text-muted-foreground font-medium border-t pt-6">
              Your responses are stored locally for privacy. You can optionally contribute 
              anonymously to research at the end.
            </p>
          </div>

          {/* Secondary Links */}
          <div className="space-y-4">
            <p className="text-base font-bold text-foreground">Learn more:</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              <Link href="/docs/format" className="text-primary hover:underline font-medium">
                File format specification
              </Link>
              <Link href="/docs/dataset" className="text-primary hover:underline font-medium">
                Dilemmas dataset
              </Link>
              <Link href="/blog/llm-biases" className="text-primary hover:underline font-medium">
                LLM biases research
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
