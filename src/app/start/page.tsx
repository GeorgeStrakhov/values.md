'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    const startSession = async () => {
      try {
        // Get a random dilemma ID from the API
        const response = await fetch('/api/dilemmas/random');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.dilemmaId) {
          // Redirect to the explore page with the dilemma ID
          router.push(`/explore/${data.dilemmaId}`);
        } else {
          throw new Error('No dilemma ID received from API');
        }
        
      } catch (error) {
        console.error('Failed to start session:', error);
        // Redirect to home with error
        router.push('/?error=start-failed');
      }
    };

    startSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-lg mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Starting Your Session</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              <span>Loading your first dilemma...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}