import { NextRequest, NextResponse } from 'next/server';
import type { APICallRequest, APIResponse } from '@/types/adventure';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: APICallRequest = await request.json();

    // Changed default model to Quasar Alpha
    const model = body.model ?? 'openrouter/quasar-alpha';

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_BASE_URL ?? '',  // optional
        'X-Title': 'Minecraft Adventure',                // optional
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('OpenRouter API error response:', data);
      return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
    }

    const content = data.choices?.[0]?.message?.content ?? 'No response generated.';

    const apiResp: APIResponse = {
      message: content,
      imageUrl: undefined,
      choices: undefined,
    };

    return NextResponse.json(apiResp);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}