'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState({
    aiSystem: '',
    scenario: '',
    baseline: '',
    aligned: '',
    rating: '',
    helpful: '',
    specific: '',
    improvements: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-4">Thank You!</h2>
              <p className="text-green-800 mb-6">
                Your feedback helps us understand whether VALUES.md actually works in practice. 
                Real user reports like yours are essential for improving the system.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Submit More Feedback
                </Button>
                <Button asChild>
                  <a href="/integration">Test More AI Systems</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">VALUES.md Feedback</h1>
          <p className="text-muted-foreground text-lg">
            Help us understand if VALUES.md actually changes AI behavior in useful ways
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI System Used */}
          <Card>
            <CardHeader>
              <CardTitle>Which AI system did you test?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['ChatGPT', 'Claude', 'Gemini', 'Other'].map(system => (
                  <button
                    key={system}
                    type="button"
                    onClick={() => setFeedback({...feedback, aiSystem: system})}
                    className={`p-3 border rounded-lg text-sm transition-all ${
                      feedback.aiSystem === system 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {system}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Tested */}
          <Card>
            <CardHeader>
              <CardTitle>What did you ask about?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedback.scenario}
                onChange={(e) => setFeedback({...feedback, scenario: e.target.value})}
                placeholder="e.g., 'Should I invest in stocks or bonds for retirement?'"
                className="min-h-[80px]"
                required
              />
            </CardContent>
          </Card>

          {/* Response Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare the AI responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Baseline AI response (without VALUES.md):
                </label>
                <Textarea
                  value={feedback.baseline}
                  onChange={(e) => setFeedback({...feedback, baseline: e.target.value})}
                  placeholder="Paste or summarize the AI's response without your values..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Aligned AI response (with VALUES.md):
                </label>
                <Textarea
                  value={feedback.aligned}
                  onChange={(e) => setFeedback({...feedback, aligned: e.target.value})}
                  placeholder="Paste or summarize the AI's response when using your VALUES.md..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Was there a meaningful difference?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'major', label: 'Major Difference', desc: 'Completely different approach', icon: ThumbsUp },
                  { value: 'minor', label: 'Minor Difference', desc: 'Somewhat different emphasis', icon: AlertCircle },
                  { value: 'none', label: 'No Difference', desc: 'Essentially the same response', icon: ThumbsDown }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFeedback({...feedback, rating: option.value})}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      feedback.rating === option.value 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <option.icon className="h-5 w-5" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Helpfulness */}
          {feedback.rating && feedback.rating !== 'none' && (
            <Card>
              <CardHeader>
                <CardTitle>Was the VALUES.md response more helpful?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'much_better', label: 'Much Better', desc: 'Clearly more useful for my situation' },
                    { value: 'slightly_better', label: 'Slightly Better', desc: 'A bit more relevant or helpful' },
                    { value: 'worse', label: 'Worse', desc: 'Less helpful than baseline' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFeedback({...feedback, helpful: option.value})}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        feedback.helpful === option.value 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium mb-1">{option.label}</div>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specific Examples */}
          <Card>
            <CardHeader>
              <CardTitle>What specifically changed?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedback.specific}
                onChange={(e) => setFeedback({...feedback, specific: e.target.value})}
                placeholder="e.g., 'The AI focused more on safety and included specific risk warnings' or 'The response was more quantitative with actual numbers'"
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>How could VALUES.md be improved?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedback.improvements}
                onChange={(e) => setFeedback({...feedback, improvements: e.target.value})}
                placeholder="Suggestions for making VALUES.md more effective or easier to use..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <p>Your feedback is anonymous and helps improve VALUES.md for everyone.</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || !feedback.scenario || !feedback.baseline || !feedback.aligned || !feedback.rating}
                  size="lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}