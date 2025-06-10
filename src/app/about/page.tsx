export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About values.md</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <p className="mb-6">
            Through a series of carefully crafted ethical dilemmas, we help you discover and articulate your personal values in a format that can be used to better align AI systems with your moral framework.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
          <p className="mb-6">
            Your responses are stored locally in your browser and only shared anonymously if you choose to contribute to research.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Research</h2>
          <p>
            This platform is part of ongoing research into personal values identification and AI alignment. Learn more on our research page.
          </p>
        </div>
      </div>
    </div>
  );
}