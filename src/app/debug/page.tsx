'use client';

import { useState, useEffect } from 'react';
import { useDilemmaStore } from '@/store/dilemma-store';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const { 
    dilemmas, 
    responses, 
    sessionId, 
    currentIndex,
    selectedOption,
    reasoning,
    perceivedDifficulty
  } = useDilemmaStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Store State</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold">Session Info</h2>
          <p>Session ID: {sessionId}</p>
          <p>Current Index: {currentIndex}</p>
          <p>Total Dilemmas: {dilemmas.length}</p>
          <p>Total Responses: {responses.length}</p>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold">Current State</h2>
          <p>Selected Option: {selectedOption || 'None'}</p>
          <p>Reasoning: {reasoning || 'None'}</p>
          <p>Difficulty: {perceivedDifficulty}</p>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold">Responses</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(responses, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold">LocalStorage</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {typeof window !== 'undefined' && localStorage.getItem('dilemma-session')}
          </pre>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold">Available Dilemmas</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(dilemmas.slice(0, 3), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}