'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HealthCheck {
  status: 'pass' | 'fail';
  description: string;
  details?: string;
  timestamp: string;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, HealthCheck>;
  metadata: {
    version: string;
    build: string;
    uptime: number;
  };
}

export default function HealthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/admin');
      return;
    }

    fetchHealthData();
  }, [session, status, router]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const runDilemmaTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/test-dilemma-flow', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Test failed: ${response.status}`);
      }
      
      await fetchHealthData(); // Refresh health data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'fail':
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <div className="flex gap-4">
            <Button onClick={fetchHealthData} disabled={loading}>
              Refresh
            </Button>
            <Button onClick={runDilemmaTest} disabled={loading} variant="outline">
              Test Dilemma Flow
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Running health checks...</p>
            </CardContent>
          </Card>
        )}

        {healthData && (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Overall Status
                  <Badge className={getStatusColor(healthData.status)}>
                    {healthData.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-mono">{healthData.metadata.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Build</p>
                    <p className="font-mono">{healthData.metadata.build}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-mono">{Math.round(healthData.metadata.uptime / 1000)}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(healthData.checks).map(([name, check]) => (
                <Card key={name} className={check.status === 'fail' ? 'border-red-200' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{name.replace(/_/g, ' ')}</span>
                      <Badge className={getStatusColor(check.status)}>
                        {check.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{check.description}</p>
                    {check.details && (
                      <div className="bg-muted p-3 rounded text-xs font-mono">
                        {check.details}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Last checked: {new Date(check.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}