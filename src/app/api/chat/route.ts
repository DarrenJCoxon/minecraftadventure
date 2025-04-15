import { NextRequest, NextResponse } from 'next/server';
// Assuming your types are in '@/types/adventure' - adjust if needed
import type { APICallRequest, APIResponse } from '@/types/adventure';

export const runtime = 'edge';

// Define a more specific type for the messages (kept from your original)
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Using the type from your original code
    const body: APICallRequest = await request.json();

    // --- Model Update ---
    // Set the model directly to the requested Deepseek model
    const model = 'deepseek/deepseek-chat-v3-0324:free';
    // --- End Model Update ---

    // Ensure the messages array is properly formatted (kept from your original)
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Ensure we have the API key (kept from your original)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENROUTER_API_KEY environment variable');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Log request for debugging (kept from your original, including context fields)
    console.log('Adventure request:', {
      model, // Now logs the Deepseek model name
      messageCount: body.messages.length,
      hero: body.hero, // Kept from original
      world: body.world, // Kept from original
      storyline: body.storyline, // Kept from original
      turnCount: extractTurnCount(body.messages) // Uses original helper
    });

    // Prepare messages for API call (kept from your original)
    const messages = body.messages;

    // Retaining original logic for potentially modifying system prompt (kept from your original)
    const systemIndex = messages.findIndex(m => m.role === "system");
    if (systemIndex !== -1) {
      const turnCount = extractTurnCount(messages);
      // This logic remains unchanged from your original code
      if (turnCount && turnCount < 40 &&
          !messages[systemIndex].content.includes("DO NOT end or summarize the entire adventure yet")) {
        messages[systemIndex].content += "\n\nIMPORTANT: This adventure should continue for many more turns. DO NOT end the adventure prematurely.";
      }
    }

    // Fetch call to OpenRouter API
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Kept original headers from your code
        'HTTP-Referer': process.env.APP_BASE_URL ?? '',
        'X-Title': 'Minecraft Adventure',
      },
      body: JSON.stringify({
        model, // Pass the updated model variable here
        messages,
        // Kept original parameters from your code
        max_tokens: 1200,
        temperature: 0.75,
      }),
    });

    // Check for HTTP errors (kept from your original)
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => null); // Keep original error handling
      console.error('OpenRouter API error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        data: errorData
      });
      return NextResponse.json({
        error: `API error: ${apiResponse.status} ${apiResponse.statusText}`
      }, { status: apiResponse.status });
    }

    // Parse the successful JSON response
    const data = await apiResponse.json();

    // Validate response structure (kept from your original)
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json({ error: 'Invalid API response format' }, { status: 500 });
    }

    // Extract the message content (kept from your original)
    const content = data.choices[0].message.content ?? 'No response generated.';

    // Retaining original logic for checking premature adventure ending (kept from your original)
    let finalContent = content;
    const turnCount = extractTurnCount(messages);
    // This logic remains unchanged from your original code
    if (turnCount && turnCount < 35 && /adventure (is)? over/i.test(content)) {
      finalContent = content.replace(
        /adventure (is)? over/gi,
        "adventure continues with new challenges ahead" // Kept original replacement text
      );
      console.log("Prevented premature adventure ending at turn", turnCount);
    }

    // Using original APIResponse type definition (kept from your original)
    const apiResp: APIResponse = {
      message: finalContent,
      imageUrl: undefined, // Kept from original
      choices: undefined, // Kept from original
    };

    // Return the response (kept from your original)
    return NextResponse.json(apiResp);

  } catch (error) { // Keep original catch block
    console.error('Route error:', error instanceof Error ? error.message : error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to extract turn count (kept entirely from your original)
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

// The import for types remains at the top, as per standard practice and your original code.