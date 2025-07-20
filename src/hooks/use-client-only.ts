// BULLETPROOF CLIENT-SIDE HOOK - Prevents SSR hydration mismatches

import { useState, useEffect } from 'react';

export function useClientOnly<T>(clientValue: T, serverValue: T): T {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? clientValue : serverValue;
}

// Hook for client-only storage operations
export function useClientStorage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return { isClient };
}