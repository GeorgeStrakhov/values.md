import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    deployed: true,
    timestamp: new Date().toISOString(),
    test: 'AUG-1-DEPLOY-TEST',
    message: 'If you see this, deployment is working! 🌸',
    randomDilemmaTest: 'JSON format working'
  });
}