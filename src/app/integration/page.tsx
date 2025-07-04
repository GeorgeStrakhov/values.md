'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';

export default function IntegrationPage() {
  const [userValuesUrl, setUserValuesUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate bookmarklet code
  const generateBookmarklet = (valuesUrl: string) => {
    const bookmarkletCode = `
javascript:(function(){
  const valuesUrl = '${valuesUrl}';
  
  function injectValues() {
    // Find the main input or textarea for AI chat
    const inputs = document.querySelectorAll('textarea, input[type="text"]');
    let mainInput = null;
    
    // Common AI chat input patterns
    for (let input of inputs) {
      const placeholder = input.placeholder?.toLowerCase() || '';
      const id = input.id?.toLowerCase() || '';
      const className = input.className?.toLowerCase() || '';
      
      if (placeholder.includes('message') || placeholder.includes('ask') || placeholder.includes('chat') ||
          id.includes('prompt') || id.includes('input') || id.includes('message') ||
          className.includes('prompt') || className.includes('input')) {
        mainInput = input;
        break;
      }
    }
    
    if (!mainInput) {
      alert('Could not find AI chat input. Try clicking in the chat box first.');
      return;
    }
    
    // Fetch values document
    fetch(valuesUrl)
      .then(response => response.text())
      .then(valuesText => {
        const prefix = "Please respond according to these values:\\n\\n" + valuesText + "\\n\\nUser question: ";
        
        // Create enhanced input
        const currentValue = mainInput.value || '';
        const newValue = currentValue.startsWith('Please respond according to these values:') 
          ? currentValue 
          : prefix + currentValue;
        
        mainInput.value = newValue;
        mainInput.focus();
        
        // Trigger input events for React/Vue apps
        mainInput.dispatchEvent(new Event('input', { bubbles: true }));
        mainInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Add visual indicator
        if (!document.getElementById('values-md-indicator')) {
          const indicator = document.createElement('div');
          indicator.id = 'values-md-indicator';
          indicator.style.cssText = \`
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #10b981; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-family: sans-serif; 
            font-size: 14px; 
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          \`;
          indicator.textContent = '✓ VALUES.md Active';
          document.body.appendChild(indicator);
          
          setTimeout(() => indicator.remove(), 3000);
        }
      })
      .catch(error => {
        alert('Failed to load VALUES.md. Make sure the URL is correct and publicly accessible.');
      });
  }
  
  injectValues();
})();
`.trim();

    return bookmarkletCode;
  };

  const copyBookmarklet = () => {
    if (!userValuesUrl) {
      alert('Please enter your VALUES.md URL first');
      return;
    }

    const bookmarklet = generateBookmarklet(userValuesUrl);
    navigator.clipboard.writeText(bookmarklet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const testWithChatGPT = () => {
    if (!userValuesUrl) {
      alert('Please enter your VALUES.md URL first');
      return;
    }
    window.open('https://chat.openai.com', '_blank');
  };

  const testWithClaude = () => {
    if (!userValuesUrl) {
      alert('Please enter your VALUES.md URL first');
      return;
    }
    window.open('https://claude.ai', '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Test VALUES.md with Real AI Systems</h1>
          <p className="text-muted-foreground text-lg">
            Use your VALUES.md with ChatGPT, Claude, or any AI chat interface
          </p>
        </div>

        {/* Step 1: Get VALUES.md URL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Get Your VALUES.md URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                First, generate your VALUES.md file and host it publicly (GitHub, Pastebin, etc.)
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <a href="/explore/demo">Generate My VALUES.md</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://pastebin.com" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Host on Pastebin
                  </a>
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your VALUES.md URL:
              </label>
              <Textarea
                value={userValuesUrl}
                onChange={(e) => setUserValuesUrl(e.target.value)}
                placeholder="https://pastebin.com/raw/your-values-md"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL must be publicly accessible and return raw text
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Install Bookmarklet */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 2: Install VALUES.md Bookmarklet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Install:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Copy the bookmarklet code below</li>
                <li>Create a new bookmark in your browser</li>
                <li>Paste the code as the URL/location</li>
                <li>Name it "Apply VALUES.md"</li>
                <li>Click the bookmark on any AI chat page</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Button onClick={copyBookmarklet} className="flex items-center gap-2">
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Bookmarklet'}
                </Button>
                <Badge variant="outline">Click to copy the bookmarklet code</Badge>
              </div>
              
              {userValuesUrl && (
                <div className="bg-muted p-3 rounded text-xs font-mono break-all">
                  {generateBookmarklet(userValuesUrl).substring(0, 200)}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Test with AI Systems */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 3: Test with AI Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">ChatGPT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test your VALUES.md with OpenAI's ChatGPT interface
                  </p>
                  <Button onClick={testWithChatGPT} className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open ChatGPT
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Claude</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test your VALUES.md with Anthropic's Claude interface
                  </p>
                  <Button onClick={testWithClaude} className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Claude
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open one of the AI chat interfaces above</li>
                <li>Type a question like "Should I invest in stocks or bonds?"</li>
                <li>Click your VALUES.md bookmark</li>
                <li>Submit your question and see how the AI response changes</li>
                <li>Compare with asking the same question without VALUES.md</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Example Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Example Test Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Financial Decisions:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "Should I pay off debt or invest?"</li>
                  <li>• "Help me choose a retirement strategy"</li>
                  <li>• "Is cryptocurrency worth the risk?"</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Ethical Dilemmas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "Should I report a colleague's mistake?"</li>
                  <li>• "How should I handle this family conflict?"</li>
                  <li>• "Is it ethical to use AI for this task?"</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Career Choices:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "Should I take this risky job opportunity?"</li>
                  <li>• "How do I balance work and family?"</li>
                  <li>• "Should I start my own business?"</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Personal Decisions:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "How should I handle this relationship issue?"</li>
                  <li>• "Should I move to a new city?"</li>
                  <li>• "How do I make this medical decision?"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}