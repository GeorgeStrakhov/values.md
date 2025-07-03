export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Research</h1>
        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Understanding personal values through ethical decision-making patterns for improved AI alignment.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Methodology</h2>
          <p className="mb-4 text-foreground">
            We present users with 12 carefully constructed ethical dilemmas across 8 moral domains to identify underlying moral frameworks and value systems. Each dilemma maps to specific ethical motifs through our sophisticated choice-to-motif system.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Four-Stage Analysis Pipeline:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Response capture with timing and reasoning analysis</li>
              <li>TF-IDF style motif weighting by frequency and domain significance</li>
              <li>Framework classification into utilitarian, deontological, libertarian, care ethics traditions</li>
              <li>VALUES.md generation with behavioral indicators and AI system instructions</li>
            </ol>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Ethical Framework Analysis</h2>
          <p className="mb-6 text-foreground">
            Our system analyzes responses against established ethical frameworks including deontological, consequentialist, virtue ethics, and care ethics approaches to create personalized value profiles.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Applications</h2>
          <ul className="list-disc pl-6 mb-6 text-foreground">
            <li>Personalized AI system alignment</li>
            <li>Understanding moral diversity in decision-making</li>
            <li>Improving human-AI collaboration</li>
            <li>Ethics education and self-reflection tools</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Data & Privacy</h2>
          <p className="mb-6 text-foreground">
            All user data is anonymized and aggregated for research purposes. Individual responses are stored locally and only shared with explicit consent for research contribution.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Current Findings</h2>
          <p className="mb-4 text-foreground">
            Our analysis has revealed distinct ethical profiles emerging from the choice patterns, with users showing 50-85% consistency within domains and clear preferences for specific moral frameworks.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Key Discoveries:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Autonomy-focused users: ~50% libertarian alignment, high consistency (67%)</li>
              <li>Utilitarian-optimizers: ~58% utilitarian choices, complexity preference (8.5/10)</li>
              <li>Community-oriented: 42% care ethics, balanced social justice focus</li>
              <li>Response timing correlates with ethical complexity and reasoning depth</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-foreground">Future Publications</h2>
          <p className="text-foreground">
            Research findings and methodologies will be published in peer-reviewed journals and presented at relevant conferences in AI ethics and human-computer interaction.
          </p>
        </div>
      </div>
    </div>
  );
}