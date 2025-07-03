export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">About values.md</h1>
        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Research platform for exploring personal values through ethical dilemmas to generate personalized &quot;values.md&quot; files for LLM alignment.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">How it works</h2>
          <p className="mb-4 text-foreground">
            Through a series of 12 carefully crafted ethical dilemmas across diverse domains, we help you discover and articulate your personal values in a structured format for AI alignment.
          </p>
          <ul className="list-disc pl-6 mb-6 text-foreground">
            <li><strong>Ethical Dilemma Sequence:</strong> Navigate 12 scenarios covering technology, medical ethics, social justice, and governance</li>
            <li><strong>Detailed Response Capture:</strong> Your choices, reasoning, timing, and difficulty ratings are all analyzed</li>
            <li><strong>TF-IDF Style Analysis:</strong> We weight 34+ ethical motifs by frequency and domain significance</li>
            <li><strong>Values.md Generation:</strong> Receive a personalized, machine-readable ethical framework file</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Privacy</h2>
          <p className="mb-6 text-foreground">
            Your responses are stored locally in your browser and only shared anonymously if you choose to contribute to research.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Research</h2>
          <p className="mb-6 text-foreground">
            This platform is part of ongoing research into personal values identification and AI alignment. Learn more on our research page.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-foreground">Team</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">George Strakhov</h3>
              <p className="text-muted-foreground mb-3">Project Lead & Research Director</p>
              <p className="text-sm mb-3">
                Researcher focused on AI alignment, digital governance, and the intersection of technology and ethics.
              </p>
              <a 
                href="https://georgestrakhov.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                georgestrakhov.com →
              </a>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Claude (Anthropic)</h3>
              <p className="text-muted-foreground mb-3">Technical Development & Architecture</p>
              <p className="text-sm mb-3">
                AI assistant focused on ethical AI development, contributing to the technical implementation and research methodology.
              </p>
              <a 
                href="https://claude.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                claude.ai →
              </a>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-foreground">Contributing</h2>
          <p className="text-foreground">
            This is an open research project. We welcome contributions to the methodology, dataset curation, 
            and technical development. Contact us through our individual websites or contribute to the research 
            by completing the values assessment and optionally sharing your anonymized responses.
          </p>
        </div>
      </div>
    </div>
  );
}