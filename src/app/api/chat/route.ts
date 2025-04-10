import { NextRequest, NextResponse } from 'next/server';
import type { APICallRequest, APIResponse } from '@/types/adventure';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: APICallRequest = await request.json();

    // Changed default model to Quasar Alpha
    const model = body.model ?? 'deepseek/deepseek-chat-v3-0324:free';
    
    // Ensure the messages array is properly formatted
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Ensure we have the API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENROUTER_API_KEY environment variable');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Log request for debugging (keep in mind this will expose data in logs)
    console.log('OpenRouter request:', {
      model,
      messageCount: body.messages.length,
      firstMessageRole: body.messages[0]?.role,
    });

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_BASE_URL ?? '',  // optional
        'X-Title': 'Minecraft Adventure',                // optional
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        max_tokens: 1000,  // Ensure we get a reasonable response length
        temperature: 0.7,  // Add some creativity but not too random
      }),
    });

    // Check for HTTP errors
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => null);
      console.error('OpenRouter API error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        data: errorData
      });
      return NextResponse.json({ 
        error: `API error: ${apiResponse.status} ${apiResponse.statusText}` 
      }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json({ error: 'Invalid API response format' }, { status: 500 });
    }

    const content = data.choices[0].message.content ?? 'No response generated.';

    const apiResp: APIResponse = {
      message: content,
      imageUrl: undefined,
      choices: undefined,
    };

    return NextResponse.json(apiResp);
  } catch (error) {
    console.error('Route error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}