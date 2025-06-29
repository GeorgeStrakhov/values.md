import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DatasetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Dilemmas Dataset</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the collection of ethical dilemmas used for values discovery
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our ethical dilemma dataset consists of carefully curated scenarios designed to reveal personal values across multiple dimensions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>200+ unique dilemmas</strong> spanning 8 moral domains</li>
                <li><strong>4 ethical frameworks</strong> systematically represented</li>
                <li><strong>50+ moral motifs</strong> covering human value patterns</li>
                <li><strong>Difficulty-calibrated</strong> scenarios from everyday to extreme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moral Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Individual Ethics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Personal autonomy</li>
                    <li>• Privacy rights</li>
                    <li>• Self-determination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Social Justice</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fairness & equality</li>
                    <li>• Resource distribution</li>
                    <li>• Collective welfare</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technology & Society</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI governance</li>
                    <li>• Digital rights</li>
                    <li>• Innovation ethics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Global Citizenship</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Environmental stewardship</li>
                    <li>• Cultural preservation</li>
                    <li>• International cooperation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ethical Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Consequentialism</h4>
                  <p className="text-sm text-muted-foreground">Outcome-focused reasoning prioritizing results over methods</p>
                </div>
                <div>
                  <h4 className="font-semibold">Deontological</h4>
                  <p className="text-sm text-muted-foreground">Rule-based ethics emphasizing duties and rights</p>
                </div>
                <div>
                  <h4 className="font-semibold">Virtue Ethics</h4>
                  <p className="text-sm text-muted-foreground">Character-based reasoning focusing on moral virtues</p>
                </div>
                <div>
                  <h4 className="font-semibold">Care Ethics</h4>
                  <p className="text-sm text-muted-foreground">Relationship-centered approach emphasizing empathy and context</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This dataset enables research in:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>AI alignment and value learning</li>
                <li>Cross-cultural moral psychology</li>
                <li>Ethical decision-making models</li>
                <li>Values-based system design</li>
                <li>Moral reasoning in artificial agents</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}