'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StartFreshPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct start page
    router.replace('/start');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to start your values journey...</p>
      </div>
    </div>
  );
}