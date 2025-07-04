import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Research Methodology</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How we discover personal values through ethical dilemma analysis
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Values Discovery Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our methodology combines ethical philosophy, behavioral psychology, and computational analysis to reveal authentic personal values through decision patterns.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Four-Stage Pipeline:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Dilemma Presentation</strong> - 12 carefully selected ethical scenarios across domains</li>
                  <li><strong>Response Capture</strong> - Choice (A/B/C/D), reasoning, timing, and difficulty rating</li>
                  <li><strong>Motif Analysis</strong> - TF-IDF style weighting of ethical motifs from choice patterns</li>
                  <li><strong>Framework Classification</strong> - Statistical alignment with established ethical theories</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ethical Motif System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We identify 34+ core ethical motifs that capture the fundamental moral intuitions underlying human decision-making:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Individual-Focused</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AUTONOMY_RESPECT</li>
                    <li>• INDIVIDUAL_LIBERTY</li>
                    <li>• CONSENT_BASED</li>
                    <li>• EXPERT_DEFERENCE</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Collective-Focused</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SOCIAL_JUSTICE</li>
                    <li>• EQUAL_TREAT</li>
                    <li>• UTIL_CALC</li>
                    <li>• HARM_MINIMIZE</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rule-Based</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• DEONT_ABSOLUTE</li>
                    <li>• DUTY_CARE</li>
                    <li>• JUST_PROCEDURAL</li>
                    <li>• MERIT_BASED</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Context-Sensitive</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CARE_PARTICULAR</li>
                    <li>• PRECAUTION</li>
                    <li>• CULTURAL_PRESERVE</li>
                    <li>• RELATIONSHIP_PRIORITY</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistical Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We apply TF-IDF style analysis to weight moral motifs by both frequency and domain significance:
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-mono text-sm font-semibold mb-2">Motif Weighting Formula:</h4>
                <pre className="text-sm text-muted-foreground">
{`TF = motif_frequency / total_responses
IDF = log(domains_count / domains_containing_motif)  
Weight = TF × IDF`}
                </pre>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Consistency Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Measure of domain-specific consistency: percentage of domains where primary motif appears in {'>'}60% of responses
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Framework Alignment</h4>
                  <p className="text-sm text-muted-foreground">
                    Statistical classification into utilitarian, deontological, libertarian, care ethics, and other ethical traditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behavioral Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We capture multiple dimensions of ethical decision-making beyond just choice selection:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Temporal Patterns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Response time distribution</li>
                    <li>• Difficulty preferences</li>
                    <li>• Decision confidence</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reasoning Analysis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Qualitative reasoning depth</li>
                    <li>• Stakeholder consideration</li>
                    <li>• Moral justification patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VALUES.md Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The final VALUES.md file provides a structured, machine-readable representation of ethical preferences:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Core Framework Identification</h4>
                  <p className="text-sm text-muted-foreground">
                    Primary ethical tradition based on weighted motif analysis and consistency patterns
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Behavioral Indicators</h4>
                  <p className="text-sm text-muted-foreground">
                    Specific guidance on how values manifest in decision-making behavior
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">AI System Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    Actionable guidance for AI systems to align with discovered value patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation & Reliability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Internal Consistency</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cross-domain coherence measurement</li>
                    <li>• Temporal stability assessment</li>
                    <li>• Response pattern validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">External Validity</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Correlation with established ethical inventories</li>
                    <li>• Cross-cultural applicability testing</li>
                    <li>• Predictive validity for real-world choices</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}