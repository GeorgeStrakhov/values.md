'use client';

import { useDilemmaStore } from '@/store/dilemma-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const {
    dilemmas,
    responses,
    sessionId,
    currentIndex,
    selectedOption,
    setSelectedOption,
    saveCurrentResponse,
    goToNext
  } = useDilemmaStore();

  const testFlow = async () => {
    console.log('=== TESTING STORE FLOW ===');
    
    // 1. Check initial state
    console.log('Initial state:', { 
      dilemmaCount: dilemmas.length, 
      responseCount: responses.length, 
      sessionId, 
      currentIndex 
    });
    
    if (dilemmas.length === 0) {
      console.log('No dilemmas, fetching...');
      try {
        const response = await fetch('/api/dilemmas/random');
        const redirectUrl = response.url;
        console.log('Random API redirected to:', redirectUrl);
        
        // Extract UUID from redirect URL
        const match = redirectUrl.match(/\/explore\/([^\/]+)/);
        if (match) {
          const uuid = match[1];
          console.log('Extracted UUID:', uuid);
          
          const dilemmaResponse = await fetch(`/api/dilemmas/${uuid}`);
          const data = await dilemmaResponse.json();
          console.log('Fetched dilemmas:', data.dilemmas?.length);
          
          // This should trigger setDilemmas
          window.location.href = `/explore/${uuid}`;
        }
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
      }
    } else {
      // 2. Test saving a response
      setSelectedOption('A');
      console.log('Set option A');
      
      saveCurrentResponse();
      console.log('Saved response. New response count:', responses.length);
      
      // 3. Check localStorage
      const stored = localStorage.getItem('dilemma-session');
      console.log('localStorage data:', stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed localStorage:', parsed);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Store</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Dilemmas: {dilemmas.length}</div>
            <div>Responses: {responses.length}</div>
            <div>Session ID: {sessionId}</div>
            <div>Current Index: {currentIndex}</div>
            <div>Selected Option: {selectedOption}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>localStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Keys: {typeof window !== 'undefined' ? Object.keys(localStorage).join(', ') : 'SSR'}</div>
            <div className="text-xs overflow-hidden">
              dilemma-session: {typeof window !== 'undefined' ? localStorage.getItem('dilemma-session')?.substring(0, 100) + '...' : 'SSR'}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={testFlow}>Test Flow</Button>
    </div>
  );
}