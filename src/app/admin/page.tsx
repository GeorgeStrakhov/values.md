'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, TestTube, Map, ExternalLink, Zap } from 'lucide-react';
import { AdminProtection, DestructiveActionProtection } from '@/components/admin-protection';
import { AdminErrorBoundary } from '@/components/error-boundary';
import { AdminStateIndicators, StateAwareButton } from '@/components/system-state';

interface GeneratedDilemma {
  title: string;
  scenario: string;
  choices: { text: string; motif: string }[];
}

function AdminPageContent() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('admin@values.md');
  const [password, setPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDilemma, setGeneratedDilemma] = useState<GeneratedDilemma | null>(null);
  const [generationType, setGenerationType] = useState<'ai' | 'combinatorial'>('ai');
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordChangeMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      setPasswordChangeMessage(data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setError('Failed to change password. Please try again.');
      console.error('Error:', error);
    } finally {
      setChangingPassword(false);
    }
  };

  const generateDilemma = async () => {
    setGenerating(true);
    setError('');
    
    try {
      const endpoint = generationType === 'ai' 
        ? '/api/admin/generate-dilemma' 
        : '/api/admin/generate-combinatorial';
      
      const body = generationType === 'ai' 
        ? {
            frameworks: ['UTIL_CALC', 'DEONT_ABSOLUTE'],
            motifs: ['UTIL_CALC', 'HARM_MINIMIZE'],
            domain: 'technology',
            difficulty: 7,
          }
        : {
            domain: 'technology',
            difficulty: 7,
            targetMotifs: ['UTIL_CALC', 'HARM_MINIMIZE'],
            count: 1,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut();
          return;
        }
        throw new Error('Failed to generate dilemma');
      }

      const data = await response.json();
      
      if (generationType === 'ai') {
        setGeneratedDilemma(data.dilemma);
      } else {
        setGeneratedDilemma(data.dilemmas[0]); // Take first generated dilemma
      }
    } catch (error) {
      setError('Failed to generate dilemma. Please try again.');
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleImportSampleData = async () => {
    setImporting(true);
    setImportMessage('');
    
    try {
      const response = await fetch('/api/admin/import-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut();
          return;
        }
        throw new Error('Failed to import sample data');
      }

      const data = await response.json();
      setImportMessage(`✅ Successfully imported ${data.imported.dilemmas} dilemmas and ${data.imported.motifs} motifs`);
    } catch (error) {
      setImportMessage('❌ Failed to import sample data. Please try again.');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            {error && (
              <p className="mt-4 text-destructive text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
            <Button 
              onClick={() => signOut()} 
              variant="outline"
            >
              Logout
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* System State Indicators */}
            <AdminStateIndicators />
            
            {/* Technical Dashboards Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">System Monitoring & Research</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/health">
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="flex items-center space-x-3 p-4">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Health Dashboard</p>
                        <p className="text-sm text-muted-foreground">System status & components</p>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/test-results">
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="flex items-center space-x-3 p-4">
                      <TestTube className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Test Results</p>
                        <p className="text-sm text-muted-foreground">Validation & testing suite</p>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/project-map">
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="flex items-center space-x-3 p-4">
                      <Map className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Project Map</p>
                        <p className="text-sm text-muted-foreground">Architecture & dataflow</p>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/admin/experiment">
                  <Card className="cursor-pointer hover:bg-accent transition-colors border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center space-x-3 p-4">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">LLM Experiments</p>
                        <p className="text-sm text-muted-foreground">Run alignment tests</p>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Change Admin Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  variant="default"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
              {passwordChangeMessage && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{passwordChangeMessage}</p>
                </div>
              )}
            </div>

            {/* Import Sample Data Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Database Management</h2>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Import sample dilemmas and motifs to populate the database for testing.
                </p>
                <StateAwareButton
                  state="cyan"
                  active={!importing}
                  onClick={handleImportSampleData}
                  disabled={importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import Sample Data (6 dilemmas, 5 motifs)'}
                </StateAwareButton>
                {importMessage && (
                  <div className="mt-3">
                    <p className="text-sm">{importMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Dilemma Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generate New Dilemma</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Generation Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={generationType === 'ai' ? 'default' : 'outline'}
                      onClick={() => setGenerationType('ai')}
                      disabled={generating}
                    >
                      AI-Generated (LLM)
                    </Button>
                    <Button
                      variant={generationType === 'combinatorial' ? 'default' : 'outline'}
                      onClick={() => setGenerationType('combinatorial')}
                      disabled={generating}
                    >
                      Combinatorial (Templates)
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {generationType === 'ai' 
                      ? 'Uses Claude to generate novel ethical dilemmas with detailed prompting'
                      : 'Uses pre-defined templates with variable substitution for consistent quality'
                    }
                  </p>
                </div>
                
                <StateAwareButton
                  state="gold"
                  active={!generating}
                  onClick={generateDilemma}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : `Generate ${generationType === 'ai' ? 'AI' : 'Template'} Dilemma`}
                </StateAwareButton>
              </div>
            </div>
            
            {error && (
              <p className="text-destructive">{error}</p>
            )}

            {generatedDilemma && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Dilemma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Title:</h4>
                    <p>{generatedDilemma.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Scenario:</h4>
                    <p>{generatedDilemma.scenario}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Choices:</h4>
                    <div className="space-y-2">
                      {generatedDilemma.choices.map((choice, index) => (
                        <Card key={index} className="p-3">
                          <p><strong>{String.fromCharCode(65 + index)}:</strong> {choice.text}</p>
                          <p className="text-sm text-muted-foreground mt-1">Motif: {choice.motif}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProtection>
      <AdminErrorBoundary>
        <AdminPageContent />
      </AdminErrorBoundary>
    </AdminProtection>
  );
}