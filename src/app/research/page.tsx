'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Database, Users, FileText } from 'lucide-react';

export default function ResearchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadDataset = async (type: 'responses' | 'dilemmas' | 'demographics') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/research/export?type=${type}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download dataset');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `values-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download dataset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Research Dataset</h1>
          <p className="text-xl text-muted-foreground">
            Download anonymized ethical dilemma response data for research
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anonymized user responses to ethical dilemmas including choices, reasoning, and difficulty ratings.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Session ID</Badge>
                <Badge variant="secondary">Dilemma ID</Badge>
                <Badge variant="secondary">Choice</Badge>
                <Badge variant="secondary">Reasoning</Badge>
                <Badge variant="secondary">Response Time</Badge>
                <Badge variant="secondary">Difficulty</Badge>
              </div>
              <Button 
                onClick={() => downloadDataset('responses')}
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Responses CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dilemma Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete ethical dilemma scenarios with choices and associated moral motifs.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Dilemma ID</Badge>
                <Badge variant="secondary">Domain</Badge>
                <Badge variant="secondary">Scenario</Badge>
                <Badge variant="secondary">Choices A-D</Badge>
                <Badge variant="secondary">Motifs</Badge>
              </div>
              <Button 
                onClick={() => downloadDataset('dilemmas')}
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Dilemmas CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Optional demographic information from users who consented to research participation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Session ID</Badge>
                <Badge variant="secondary">Age Range</Badge>
                <Badge variant="secondary">Education</Badge>
                <Badge variant="secondary">Background</Badge>
                <Badge variant="secondary">Profession</Badge>
              </div>
              <Button 
                onClick={() => downloadDataset('demographics')}
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Demographics CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Data Privacy</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All data is completely anonymized</li>
                  <li>• No personally identifiable information</li>
                  <li>• Session IDs are randomly generated</li>
                  <li>• Only users who explicitly opted in</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Guidelines</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• For academic research purposes</li>
                  <li>• Please cite VALUES.md project</li>
                  <li>• Share findings with the community</li>
                  <li>• Respect ethical research practices</li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Attribution:</strong> If you use this dataset in your research, please cite: 
                "VALUES.md: A Platform for Ethical Alignment of AI Systems through Personal Values Discovery"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}