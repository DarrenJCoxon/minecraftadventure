import { NextRequest, NextResponse } from 'next/server';
import Together from "together-ai";
import type { APICallRequest, APIResponse } from '@/types/adventure';

// Removed timeout as discussed earlier

export function GET() {
  return new Response('Vercel', {
    status: 200,
  });
}

export const runtime = 'edge';

// Define a more specific type for the messages
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: APICallRequest = await request.json();

    // Ensure the messages array is properly formatted
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Ensure we have the API key
    const apiKey = process.env.TOGETHER_API_KEY; // Changed to use Together API
    if (!apiKey) {
      console.error('Missing TOGETHER_API_KEY environment variable');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Initialize the Together client
    const together = new Together({
      apiKey: apiKey,
    });

    // Log request for debugging
    console.log('Adventure request:', {
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messageCount: body.messages.length,
      hero: body.hero,
      world: body.world,
      storyline: body.storyline,
      turnCount: extractTurnCount(body.messages)
    });

    // Prepare messages for API call
    const messages = body.messages;

    // Modify system prompt if needed
    const systemIndex = messages.findIndex(m => m.role === "system");
    if (systemIndex !== -1) {
      const turnCount = extractTurnCount(messages);
      if (turnCount && turnCount < 40 &&
          !messages[systemIndex].content.includes("DO NOT end or summarize the entire adventure yet")) {
        messages[systemIndex].content += "\n\nIMPORTANT: This adventure should continue for many more turns. DO NOT end the adventure prematurely.";
      }
    }

    try {
      console.log('Calling Together AI API...');
      
      // Call the Together AI API
      const togetherResponse = await together.chat.completions.create({
        messages: messages,
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        max_tokens: 1200,
        temperature: 0.75,
      });
      
      console.log('Received response from Together AI');

      // Extract the message content
      const content = togetherResponse.choices?.[0]?.message?.content ?? 'No response generated.';

      // Check for premature adventure ending
      let finalContent = content;
      const turnCount = extractTurnCount(messages);
      if (turnCount && turnCount < 35 && /adventure (is)? over/i.test(content)) {
        finalContent = content.replace(
          /adventure (is)? over/gi,
          "adventure continues with new challenges ahead"
        );
        console.log("Prevented premature adventure ending at turn", turnCount);
      }

      // Prepare response
      const apiResp: APIResponse = {
        message: finalContent,
        imageUrl: undefined,
        choices: undefined,
      };

      // Return the response
      return NextResponse.json(apiResp);
      
    } catch (apiError) {
      console.error('Together AI API error:', apiError);
      return NextResponse.json({
        error: `API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Route error:', error instanceof Error ? error.message : error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to extract turn count
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