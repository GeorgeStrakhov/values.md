import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LLMExperimentRunner from '@/lib/llm-providers';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { apiKeys } = await request.json();

    if (!apiKeys) {
      return NextResponse.json(
        { error: 'API keys are required' },
        { status: 400 }
      );
    }

    // Test API keys
    const runner = new LLMExperimentRunner(apiKeys);
    const validation = await runner.validateApiKeys();

    // Calculate cost estimates for different experiment types
    const costEstimates = {
      small_test: 2.50,    // 10 scenarios, 2 providers
      medium_experiment: 15.00,  // 50 scenarios, 3 providers  
      full_validation: 75.00,    // 200 scenarios, 4 providers
    };

    return NextResponse.json({
      validation,
      costEstimates,
      recommendations: generateRecommendations(validation)
    });

  } catch (error) {
    console.error('API validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate API keys' },
      { status: 500 }
    );
  }
}

function generateRecommendations(validation: Record<string, boolean>) {
  const recommendations = [];
  const validProviders = Object.entries(validation).filter(([, isValid]) => isValid);
  
  if (validProviders.length === 0) {
    recommendations.push('No valid API keys found. Please provide at least one working API key.');
  } else if (validProviders.length === 1) {
    recommendations.push('Only one provider available. Consider adding more for comparative analysis.');
  } else if (validProviders.length >= 3) {
    recommendations.push('Good coverage! Multiple providers will enable robust comparative analysis.');
  }

  if (validation['openai-gpt4'] && validation['anthropic-claude']) {
    recommendations.push('GPT-4 and Claude available - ideal for high-quality reasoning comparison.');
  }

  if (validation['google-gemini']) {
    recommendations.push('Gemini available - adds valuable Google perspective to experiments.');
  }

  return recommendations;
}