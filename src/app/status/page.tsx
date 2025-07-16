'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  responseTime?: number;
  details?: string;
}

export default function StatusPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Local Dev (3000)', url: 'http://localhost:3000', status: 'checking' },
    { name: 'Local Prod (3001)', url: 'http://localhost:3001', status: 'checking' },
    { name: 'Local Proxy', url: 'http://values.uprootiny.dev', status: 'checking' },
    { name: 'Staging', url: 'https://stage.values.md', status: 'checking' },
    { name: 'Production', url: 'https://values.md', status: 'checking' },
  ]);

  const [apiStatus, setApiStatus] = useState<EndpointStatus[]>([
    { name: 'Local API Random', url: 'http://localhost:3001/api/dilemmas/random', status: 'checking' },
    { name: 'Proxy API Random', url: 'http://values.uprootiny.dev/api/dilemmas/random', status: 'checking' },
    { name: 'Staging API Random', url: 'https://stage.values.md/api/dilemmas/random', status: 'checking' },
    { name: 'Production API Random', url: 'https://values.md/api/dilemmas/random', status: 'checking' },
  ]);

  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    dilemmaCount: number;
    details: string;
  }>({ connected: false, dilemmaCount: 0, details: 'Checking...' });

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint.url, { 
        method: 'HEAD',
        mode: 'no-cors' // Allow cross-origin for external sites
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        ...endpoint,
        status: 'online',
        responseTime,
        details: `${response.status || 'OK'}`
      };
    } catch (error) {
      return {
        ...endpoint,
        status: 'offline',
        responseTime: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/status/database');
      const data = await response.json();
      
      setDbStatus({
        connected: data.connected,
        dilemmaCount: data.dilemmaCount || 0,
        details: data.error || `${data.dilemmaCount} dilemmas found`
      });
    } catch (error) {
      setDbStatus({
        connected: false,
        dilemmaCount: 0,
        details: error instanceof Error ? error.message : 'API error'
      });
    }
  };

  useEffect(() => {
    // Check all main endpoints
    Promise.all(endpoints.map(checkEndpoint)).then(setEndpoints);
    
    // Check all API endpoints
    Promise.all(apiStatus.map(checkEndpoint)).then(setApiStatus);
    
    // Check database
    checkDatabase();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-500">Online</Badge>;
      case 'offline': return <Badge variant="destructive">Offline</Badge>;
      case 'checking': return <Badge variant="secondary">Checking...</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Values.md System Status</h1>
      
      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Connection:</span>
              {getStatusBadge(dbStatus.connected ? 'online' : 'offline')}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Dilemmas:</span>
              <Badge variant="outline">{dbStatus.dilemmaCount}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{dbStatus.details}</div>
          </div>
        </CardContent>
      </Card>

      {/* Main Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Main Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{endpoint.name}</div>
                  <div className="text-sm text-muted-foreground">{endpoint.url}</div>
                </div>
                <div className="text-right">
                  {getStatusBadge(endpoint.status)}
                  {endpoint.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {endpoint.responseTime}ms
                    </div>
                  )}
                  {endpoint.details && (
                    <div className="text-xs text-muted-foreground">{endpoint.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiStatus.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{endpoint.name}</div>
                  <div className="text-sm text-muted-foreground">{endpoint.url}</div>
                </div>
                <div className="text-right">
                  {getStatusBadge(endpoint.status)}
                  {endpoint.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {endpoint.responseTime}ms
                    </div>
                  )}
                  {endpoint.details && (
                    <div className="text-xs text-muted-foreground">{endpoint.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issue Scoreboard */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Database Connection:</span>
              <Badge className="bg-green-500">FIXED ✅</Badge>
            </div>
            <div className="flex justify-between">
              <span>Local Proxy (nginx):</span>
              <Badge className="bg-green-500">WORKING ✅</Badge>
            </div>
            <div className="flex justify-between">
              <span>Staging Deployments:</span>
              <Badge variant="destructive">FAILING ❌</Badge>
            </div>
            <div className="flex justify-between">
              <span>"No responses found" Issue:</span>
              <Badge variant="destructive">RECURRING ❌</Badge>
            </div>
            <div className="flex justify-between">
              <span>Domain Redirects:</span>
              <Badge variant="secondary">MIXED ⚠️</Badge>
            </div>
            <div className="flex justify-between">
              <span>Core Flow (Landing→Dilemmas→Values):</span>
              <Badge variant="destructive">BROKEN ❌</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Health */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Local (values.uprootiny.dev)</div>
                  <div className="text-sm text-muted-foreground">Commit: {typeof window !== 'undefined' ? 'dev-local' : 'dev'}</div>
                </div>
                <Badge className="bg-green-500">DEPLOYED ✅</Badge>
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Staging (stage.values.md)</div>
                  <div className="text-sm text-muted-foreground">Commit: Unknown (deploy failed)</div>
                </div>
                <Badge variant="destructive">FAILED ❌</Badge>
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Production (values.md)</div>
                  <div className="text-sm text-muted-foreground">Commit: Unknown</div>
                </div>
                <Badge variant="secondary">UNKNOWN ⚠️</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Environment:</span> {process.env.NODE_ENV}
            </div>
            <div>
              <span className="font-medium">Timestamp:</span> {new Date().toISOString()}
            </div>
            <div>
              <span className="font-medium">Local Commit:</span> dev-build
            </div>
            <div>
              <span className="font-medium">Issues Fixed:</span> 2/6
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}