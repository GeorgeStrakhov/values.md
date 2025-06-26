'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthCheck {
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  error?: string;
}

interface HealthResults {
  timestamp: string;
  status: 'pass' | 'fail' | 'warning';
  checks: {
    database?: HealthCheck;
    dilemmas?: HealthCheck;
    randomDilemmaAPI?: HealthCheck;
    responsesAPI?: HealthCheck;
    userResponses?: HealthCheck;
    generateValuesAPI?: HealthCheck;
  };
  error?: string;
}

export default function RealHealthDashboard() {
  const [health, setHealth] = useState<HealthResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Running real health check...');
      const response = await fetch('/api/health');
      const data = await response.json();
      
      console.log('📊 Health check results:', data);
      setHealth(data);
      
      if (!response.ok) {
        setError(`Health check returned ${response.status}`);
      }
    } catch (err) {
      console.error('💥 Health check failed:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Real System Health Check</h1>
              <p className="text-muted-foreground">Actual API tests for debugging the broken pipeline</p>
            </div>
            <Button 
              onClick={runHealthCheck} 
              disabled={loading}
              className="px-6 py-2"
            >
              {loading ? '🔄 Running...' : '🔍 Run Health Check'}
            </Button>
          </div>

          {/* Overall Status */}
          {health && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getStatusIcon(health.status)}</div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {health.status === 'pass' ? 'System Operational' : 
                         health.status === 'fail' ? 'System Issues Found' : 'Partial Issues'}
                      </h2>
                      <p className="text-muted-foreground">
                        Last checked: {new Date(health.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(health.status)}>
                      {health.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">💥</div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-600">Health Check Failed</h3>
                    <p className="text-red-500">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Health Check Results */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Database Connectivity */}
            {health.checks.database && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.database.status)}
                    Database Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.database.status)}>
                    {health.checks.database.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.database.message}</p>
                  {health.checks.database.error && (
                    <pre className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {health.checks.database.error}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dilemmas Table */}
            {health.checks.dilemmas && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.dilemmas.status)}
                    Dilemmas Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.dilemmas.status)}>
                    {health.checks.dilemmas.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.dilemmas.message}</p>
                  {health.checks.dilemmas.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Count: {health.checks.dilemmas.details.count}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Random Dilemma API */}
            {health.checks.randomDilemmaAPI && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.randomDilemmaAPI.status)}
                    Random Dilemma API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.randomDilemmaAPI.status)}>
                    {health.checks.randomDilemmaAPI.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.randomDilemmaAPI.message}</p>
                  {health.checks.randomDilemmaAPI.details && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Status: {health.checks.randomDilemmaAPI.details.status}</p>
                      {health.checks.randomDilemmaAPI.details.location && (
                        <p>Redirects to: {health.checks.randomDilemmaAPI.details.location}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Responses API - Critical for our bug! */}
            {health.checks.responsesAPI && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.responsesAPI.status)}
                    Responses API
                    <Badge variant="outline" className="text-blue-600">CRITICAL</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.responsesAPI.status)}>
                    {health.checks.responsesAPI.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.responsesAPI.message}</p>
                  {health.checks.responsesAPI.details && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>HTTP Status: {health.checks.responsesAPI.details.status}</p>
                      {health.checks.responsesAPI.details.response && (
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {health.checks.responsesAPI.details.response}
                        </pre>
                      )}
                    </div>
                  )}
                  {health.checks.responsesAPI.error && (
                    <pre className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {health.checks.responsesAPI.error}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Responses Table */}
            {health.checks.userResponses && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.userResponses.status)}
                    User Responses Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.userResponses.status)}>
                    {health.checks.userResponses.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.userResponses.message}</p>
                  {health.checks.userResponses.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Stored responses: {health.checks.userResponses.details.count}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generate Values API */}
            {health.checks.generateValuesAPI && (
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.checks.generateValuesAPI.status)}
                    Generate Values API
                    <Badge variant="outline" className="text-purple-600">END-TO-END</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(health.checks.generateValuesAPI.status)}>
                    {health.checks.generateValuesAPI.status.toUpperCase()}
                  </Badge>
                  <p className="mt-2">{health.checks.generateValuesAPI.message}</p>
                  {health.checks.generateValuesAPI.details && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {health.checks.generateValuesAPI.details.status && (
                        <p>HTTP Status: {health.checks.generateValuesAPI.details.status}</p>
                      )}
                      {health.checks.generateValuesAPI.details.testedWithSession && (
                        <p>Test Session: {health.checks.generateValuesAPI.details.testedWithSession}</p>
                      )}
                      {health.checks.generateValuesAPI.details.reason && (
                        <p>Reason: {health.checks.generateValuesAPI.details.reason}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Running health checks...</p>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🔍 Debugging the &quot;No responses found&quot; Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-700 space-y-2">
              <p><strong>Key Tests:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Responses API</strong> - Tests if user responses can be saved to database</li>
                <li><strong>Generate Values API</strong> - Tests if saved responses can be converted to VALUES.md</li>
                <li><strong>Database Tables</strong> - Verifies data persistence and retrieval</li>
              </ul>
              <p className="mt-4"><strong>Expected Flow:</strong> User completes dilemmas → Responses API saves to DB → Generate Values API creates VALUES.md</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}