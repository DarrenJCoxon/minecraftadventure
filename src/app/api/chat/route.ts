import { NextRequest, NextResponse } from 'next/server';
import type { APICallRequest, APIResponse } from '@/types/adventure';

export const runtime = 'edge';

// Define a more specific type for the messages
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

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
    console.log('Adventure request:', {
      model,
      messageCount: body.messages.length,
      hero: body.hero,
      world: body.world,
      storyline: body.storyline,
      turnCount: extractTurnCount(body.messages)
    });

    // Prepare messages for API call
    const messages = body.messages;
    
    // Add narrative context to ensure longer adventures
    const systemIndex = messages.findIndex(m => m.role === "system");
    if (systemIndex !== -1) {
      // System message already has narrative guidance injected from the client

      // If we're past turn 30 and messages don't already mention NOT ending yet,
      // Add an extra reminder to not end the adventure prematurely
      const turnCount = extractTurnCount(messages);
      if (turnCount && turnCount < 40 && 
          !messages[systemIndex].content.includes("DO NOT end or summarize the entire adventure yet")) {
        messages[systemIndex].content += "\n\nIMPORTANT: This adventure should continue for many more turns. DO NOT end the adventure prematurely.";
      }
    }

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_BASE_URL ?? '',  
        'X-Title': 'Minecraft Adventure',                
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1200,  // Increased token limit for richer responses
        temperature: 0.75,  // Slightly higher temperature for more creative narratives
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

    // Check if the response prematurely ends the adventure
    let finalContent = content;
    const turnCount = extractTurnCount(messages);
    if (turnCount && turnCount < 35 && /adventure (is)? over/i.test(content)) {
      // If the AI tried to end the story too early, modify the response
      finalContent = content.replace(
        /adventure (is)? over/gi, 
        "adventure continues with new challenges ahead"
      );
      
      console.log("Prevented premature adventure ending at turn", turnCount);
    }

    const apiResp: APIResponse = {
      message: finalContent,
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

// Helper function to extract turn count from messages - now with proper typing
function extractTurnCount(messages: ChatMessage[]): number | null {
  for (const msg of messages) {
    if (msg.role === 'system') {
      const match = msg.content.match(/turn\s+(\d+)/i);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
  }
  return null;
}