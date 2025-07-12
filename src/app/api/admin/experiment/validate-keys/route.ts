import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { LLMExperimentRunner } from '@/lib/llm-providers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || ''
    };

    const runner = new LLMExperimentRunner(apiKeys);
    const status = await runner.validateApiKeys();

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error validating API keys:', error);
    return NextResponse.json(
      { error: 'Failed to validate API keys' },
      { status: 500 }
    );
  }
}