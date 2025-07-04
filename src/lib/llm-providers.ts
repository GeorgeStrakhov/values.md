// Multi-LLM Provider Integration for Experiments

interface LLMResponse {
  choice: string;
  reasoning: string;
  confidence: number;
  valuesApplied?: string[];
  tokenCount: number;
  cost: number;
  responseTime: number;
  rawResponse: string;
}

interface LLMProvider {
  name: string;
  modelName: string;
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTokens: number;
  rateLimit: number; // requests per minute
}

export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  'openai-gpt4': {
    name: 'OpenAI GPT-4',
    modelName: 'gpt-4-turbo-preview',
    costPerInputToken: 0.00001, // $0.01 per 1K tokens
    costPerOutputToken: 0.00003, // $0.03 per 1K tokens
    maxTokens: 4096,
    rateLimit: 500
  },
  'openai-gpt35': {
    name: 'OpenAI GPT-3.5 Turbo',
    modelName: 'gpt-3.5-turbo',
    costPerInputToken: 0.0000015, // $0.0015 per 1K tokens
    costPerOutputToken: 0.000002, // $0.002 per 1K tokens
    maxTokens: 4096,
    rateLimit: 3500
  },
  'anthropic-claude': {
    name: 'Anthropic Claude',
    modelName: 'claude-3-5-sonnet-20241022',
    costPerInputToken: 0.000003, // $3 per 1M tokens
    costPerOutputToken: 0.000015, // $15 per 1M tokens
    maxTokens: 4096,
    rateLimit: 60
  },
  'google-gemini': {
    name: 'Google Gemini Pro',
    modelName: 'gemini-1.5-pro',
    costPerInputToken: 0.00000125, // $1.25 per 1M tokens
    costPerOutputToken: 0.000005, // $5 per 1M tokens
    maxTokens: 4096,
    rateLimit: 60
  }
};

export class LLMExperimentRunner {
  private apiKeys: Record<string, string>;
  private rateLimiters: Map<string, RateLimiter>;

  constructor(apiKeys: Record<string, string>) {
    this.apiKeys = apiKeys;
    this.rateLimiters = new Map();
    
    // Initialize rate limiters for each provider
    Object.keys(LLM_PROVIDERS).forEach(provider => {
      this.rateLimiters.set(provider, new RateLimiter(LLM_PROVIDERS[provider].rateLimit));
    });
  }

  async validateApiKeys(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [provider, _] of Object.entries(LLM_PROVIDERS)) {
      try {
        results[provider] = await this.testApiKey(provider);
      } catch (error) {
        results[provider] = false;
      }
    }
    
    return results;
  }

  private async testApiKey(provider: string): Promise<boolean> {
    const testPrompt = "Say 'API key valid' if you can read this.";
    
    try {
      const response = await this.callLLM(provider, testPrompt, testPrompt, 0.1, 50);
      return response.rawResponse.toLowerCase().includes('api key valid');
    } catch {
      return false;
    }
  }

  async callLLM(
    provider: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Wait for rate limit
    await this.rateLimiters.get(provider)?.wait();
    
    let response: any;
    let cost: number;
    
    switch (provider) {
      case 'openai-gpt4':
      case 'openai-gpt35':
        response = await this.callOpenAI(provider, systemPrompt, userPrompt, temperature, maxTokens);
        break;
      case 'anthropic-claude':
        response = await this.callAnthropic(systemPrompt, userPrompt, temperature, maxTokens);
        break;
      case 'google-gemini':
        response = await this.callGemini(systemPrompt, userPrompt, temperature, maxTokens);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
    
    const responseTime = Date.now() - startTime;
    
    // Parse structured response
    const parsed = this.parseStructuredResponse(response.content);
    
    // Calculate cost
    const providerConfig = LLM_PROVIDERS[provider];
    cost = (response.inputTokens * providerConfig.costPerInputToken) + 
           (response.outputTokens * providerConfig.costPerOutputToken);
    
    return {
      choice: parsed.choice,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      valuesApplied: parsed.valuesApplied,
      tokenCount: response.outputTokens,
      cost,
      responseTime,
      rawResponse: response.content
    };
  }

  private async callOpenAI(provider: string, systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    const modelName = LLM_PROVIDERS[provider].modelName;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    };
  }

  private async callAnthropic(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKeys.anthropic,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens
    };
  }

  private async callGemini(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number) {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKeys.google}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Estimate token usage (Gemini doesn't always provide exact counts)
    const content = data.candidates[0].content.parts[0].text;
    const estimatedInputTokens = Math.ceil(fullPrompt.length / 4);
    const estimatedOutputTokens = Math.ceil(content.length / 4);
    
    return {
      content,
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens
    };
  }

  private parseStructuredResponse(response: string): any {
    const lines = response.split('\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.startsWith('CHOICE:')) {
        result.choice = line.replace('CHOICE:', '').trim();
      } else if (line.startsWith('REASONING:')) {
        result.reasoning = line.replace('REASONING:', '').trim();
      } else if (line.startsWith('CONFIDENCE:')) {
        result.confidence = parseInt(line.replace('CONFIDENCE:', '').trim()) || 5;
      } else if (line.startsWith('VALUES_APPLIED:')) {
        const valuesText = line.replace('VALUES_APPLIED:', '').trim();
        result.valuesApplied = valuesText.split(',').map(v => v.trim()).filter(v => v);
      }
    }
    
    // Fallbacks for missing fields
    result.choice = result.choice || 'A';
    result.reasoning = result.reasoning || response;
    result.confidence = result.confidence || 5;
    
    return result;
  }

  estimateCost(provider: string, inputTokens: number, outputTokens: number): number {
    const config = LLM_PROVIDERS[provider];
    return (inputTokens * config.costPerInputToken) + (outputTokens * config.costPerOutputToken);
  }
}

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;

  constructor(requestsPerMinute: number) {
    this.maxRequests = requestsPerMinute;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

export default LLMExperimentRunner;