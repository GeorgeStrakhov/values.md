import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log exactly what we receive
    console.log('DEBUG: Received body:', JSON.stringify(body, null, 2));
    console.log('DEBUG: Body keys:', Object.keys(body));
    console.log('DEBUG: Responses length:', body.responses?.length || 'undefined');
    console.log('DEBUG: SessionId:', body.sessionId || 'undefined');
    
    // Return diagnostic info
    return NextResponse.json({
      debug: true,
      received: body,
      bodyKeys: Object.keys(body),
      responsesLength: body.responses?.length || 0,
      hasSessionId: !!body.sessionId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error.message },
      { status: 500 }
    );
  }
}