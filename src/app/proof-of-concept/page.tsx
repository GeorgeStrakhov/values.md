'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CORE_MOTIFS = {
  NUMBERS_FIRST: {
    name: "Numbers First",
    description: "Mathematical optimization, quantified outcomes",
    color: "bg-blue-100 text-blue-800"
  },
  RULES_FIRST: {
    name: "Rules First", 
    description: "Absolute principles, non-negotiable values",
    color: "bg-red-100 text-red-800"
  },
  PERSON_FIRST: {
    name: "Person First",
    description: "Individual focus, contextual care",
    color: "bg-green-100 text-green-800"
  },
  PROCESS_FIRST: {
    name: "Process First",
    description: "Fair procedures, systematic approach", 
    color: "bg-purple-100 text-purple-800"
  },
  SAFETY_FIRST: {
    name: "Safety First",
    description: "Harm prevention, conservative choices",
    color: "bg-orange-100 text-orange-800"
  }
};

const TEST_SCENARIO = {
  title: "Investment Advice During Market Volatility",
  situation: "You're an AI assistant helping someone make investment decisions. The market has been volatile, and your user is considering moving their retirement savings from conservative bonds (3% return, very safe) to a diversified stock portfolio (potential 8% return, moderate risk). They're 45 years old with two kids approaching college age.",
  question: "What advice would you give?"
};

const AI_RESPONSES = {
  BASELINE: {
    label: "Baseline AI (No Values)",
    response: "I'd recommend considering your risk tolerance and time horizon. Stock portfolios historically outperform bonds over 20+ year periods, but come with more volatility. Given your age and college expenses coming up, a balanced approach might work - perhaps 60% stocks, 40% bonds. You should consult with a financial advisor for personalized advice."
  },
  NUMBERS_FIRST: {
    label: "AI Aligned with Your Values",
    response: "Based on quantitative analysis: Over 20 years, the probability of the stock portfolio outperforming bonds is 94%. Expected value calculation: Stock portfolio would likely generate $340,000 more by retirement than bonds. Risk analysis shows maximum potential loss in any 5-year period is 23%, but college funding timeline suggests keeping 2-3 years of expenses in safer assets. Recommended allocation: 75% stocks, 25% bonds, rebalancing annually."
  },
  RULES_FIRST: {
    label: "AI Aligned with Your Values", 
    response: "I cannot recommend any investment strategy that conflicts with your core principles. Since you've indicated that preserving your family's financial security is non-negotiable, I won't suggest any approach that could potentially jeopardize your children's education funding. Your established rule of 'never risk money you cannot afford to lose' means college savings should remain in guaranteed instruments. Only funds truly excess to family needs should consider higher-risk investments."
  },
  PERSON_FIRST: {
    label: "AI Aligned with Your Values",
    response: "Given your specific family situation, let's focus on what matters most to you personally. You mentioned your children's education is your top priority - how would you feel if market volatility meant having to delay their college plans or burden them with more student debt? Your individual circumstances matter more than general market statistics. Perhaps we should start by securing the college funding in stable assets, then discuss growth strategies for the remainder based on your personal comfort level and specific goals."
  },
  PROCESS_FIRST: {
    label: "AI Aligned with Your Values",
    response: "Let's follow a systematic decision-making process to ensure fairness and consistency. Step 1: Define your exact financial goals with specific timelines. Step 2: Complete a standardized risk assessment questionnaire. Step 3: Apply the same asset allocation methodology used by financial institutions. Step 4: Create a regular rebalancing schedule. Step 5: Establish review checkpoints every 6 months. This ensures your investment decisions follow proven procedures rather than emotional reactions to market conditions."
  },
  SAFETY_FIRST: {
    label: "AI Aligned with Your Values",
    response: "Your primary concern should be protecting what you've already saved. Market volatility can destroy decades of careful saving very quickly - many people lost 40-50% of their retirement savings in 2008. Given the uncertainty ahead and your responsibility to your children, I'd recommend maintaining your conservative approach. The 'potential' for higher returns isn't worth the very real risk of significant losses. Consider I-bonds or CDs for inflation protection while maintaining safety. Better to have guaranteed college funding than to risk your family's financial security."
  }
};

export default function ProofOfConceptPage() {
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Proof of Concept: VALUES.md in Action</h1>
          <p className="text-muted-foreground text-lg">
            See how your ethical preferences change AI responses immediately
          </p>
        </div>

        {/* Motif Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Choose Your Primary Decision-Making Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CORE_MOTIFS).map(([id, motif]) => (
                <button
                  key={id}
                  onClick={() => setSelectedMotif(id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedMotif === id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold mb-2">{motif.name}</div>
                  <div className="text-sm text-muted-foreground">{motif.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Scenario */}
        {selectedMotif && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Step 2: Test Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{TEST_SCENARIO.title}</h3>
              <p className="text-muted-foreground mb-4">{TEST_SCENARIO.situation}</p>
              <p className="font-medium">{TEST_SCENARIO.question}</p>
              
              <div className="mt-6">
                <Button 
                  onClick={() => setShowComparison(true)}
                  size="lg"
                  className="w-full"
                >
                  See How Your Values Change AI Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison */}
        {showComparison && selectedMotif && (
          <div className="space-y-6">
            {/* Baseline Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Badge variant="outline">Baseline</Badge>
                  {AI_RESPONSES.BASELINE.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{AI_RESPONSES.BASELINE.response}</p>
              </CardContent>
            </Card>

            {/* Aligned Response */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Badge className={CORE_MOTIFS[selectedMotif as keyof typeof CORE_MOTIFS].color}>
                    {CORE_MOTIFS[selectedMotif as keyof typeof CORE_MOTIFS].name}
                  </Badge>
                  {AI_RESPONSES[selectedMotif as keyof typeof AI_RESPONSES].label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{AI_RESPONSES[selectedMotif as keyof typeof AI_RESPONSES].response}</p>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Key Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {selectedMotif === 'NUMBERS_FIRST' && (
                    <>
                      <div>• <strong>Quantified outcomes:</strong> Specific percentages, dollar amounts, probabilities</div>
                      <div>• <strong>Risk calculations:</strong> Mathematical analysis of potential losses</div>
                      <div>• <strong>Data-driven:</strong> Decisions based on historical performance metrics</div>
                    </>
                  )}
                  {selectedMotif === 'RULES_FIRST' && (
                    <>
                      <div>• <strong>Principle adherence:</strong> Won't compromise core values for potential gains</div>
                      <div>• <strong>Clear boundaries:</strong> Explicit refusal to violate established rules</div>
                      <div>• <strong>Consistency:</strong> Same principles applied regardless of circumstances</div>
                    </>
                  )}
                  {selectedMotif === 'PERSON_FIRST' && (
                    <>
                      <div>• <strong>Individual focus:</strong> Asks about personal feelings and specific situation</div>
                      <div>• <strong>Contextual advice:</strong> Solutions tailored to your particular circumstances</div>
                      <div>• <strong>Relationship impact:</strong> Considers effects on family members specifically</div>
                    </>
                  )}
                  {selectedMotif === 'PROCESS_FIRST' && (
                    <>
                      <div>• <strong>Systematic approach:</strong> Clear step-by-step methodology</div>
                      <div>• <strong>Fair procedures:</strong> Uses standardized, consistent decision frameworks</div>
                      <div>• <strong>Regular reviews:</strong> Built-in checkpoints and rebalancing schedule</div>
                    </>
                  )}
                  {selectedMotif === 'SAFETY_FIRST' && (
                    <>
                      <div>• <strong>Risk aversion:</strong> Emphasizes potential for loss over potential gains</div>
                      <div>• <strong>Historical examples:</strong> References past market crashes as warnings</div>
                      <div>• <strong>Conservative defaults:</strong> Recommends safer options even if returns are lower</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">This is VALUES.md in Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  The aligned AI response reflects your decision-making style automatically. 
                  This same approach works across domains: medical decisions, career advice, 
                  ethical dilemmas, and more.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => {setSelectedMotif(null); setShowComparison(false);}}>
                    Try Another Style
                  </Button>
                  <Button asChild>
                    <a href="/api/dilemmas/random">Create Your Full VALUES.md</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}