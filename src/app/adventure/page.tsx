'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import type { APIResponse, APICallRequest } from '@/types/adventure';

type MessageRole = "user" | "assistant" | "system";

interface Message {
  role: MessageRole;
  content: string;
}

// Create a separate component that uses useSearchParams
function AdventureContent() {
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const hero = params.get('hero') || 'Steve';
  const world = params.get('world') || 'Overworld';

  const [story, setStory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (story.length === 0) startStory();
    setTimeout(() => inputRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function detectEnded(text: string) {
    return /adventure (is)? over/i.test(text);
  }

  async function startStory() {
    setLoading(true);
    try {
      // Replace the startStory() prompt with this enhanced narrative structure:

    const prompt = `
    You are crafting an epic, immersive Minecraft adventure for a brave hero named ${hero} exploring the mysterious ${world} biome.

    Follow this narrative structure to create a compelling beginning:

    1. OPENING IMAGE (First paragraph): Begin with a brief, peaceful moment showing the hero's normal life in their home village or base. Show a glimpse of their personality, skills, and everyday routine.

    2. SET-UP (Second paragraph): Establish the world around them - describe the village, the people, or environment that represents "normal" for the hero. Hint at something that's missing in their life or a skill they're known for.

    3. CATALYST/INCITING INCIDENT (Third paragraph): Introduce a disruption that shatters the equilibrium - perhaps a mysterious traveler arrives with news, a monster attack begins, a strange object is discovered, or an unusual weather event occurs.

    4. CALL TO ACTION (Fourth paragraph): Present the hero with a clear invitation to adventure - someone asks for help, they discover a map, they witness something that demands investigation, or they're chosen for a special task.

    Write in second-person present tense (UK English), full of sensory details, emotion, and character dialogue. The language should be vibrant but suitable for an intelligent ten-year-old, with clear words, short punchy sentences mixed with occasional longer, flowing ones.

    End your response with a natural flowing paragraph suggesting 2-4 possible next actions that would represent the hero's CROSSING THE THRESHOLD into adventure. Begin this paragraph with phrases like "You might consider," "Perhaps you could," or "You feel drawn to" - these suggestions must be woven seamlessly into the narrative without numbering or bullet points.

    As the adventure continues beyond this opening, regularly introduce new characters with distinct personalities, moral choices, revelations, and plot twists that balance danger with opportunity.

    Begin NOW with this cinematically structured opening that establishes normalcy and then disrupts it with a compelling call to adventure. DO NOT include subheadings or summaries. Write in a single continuous narrative segment.
    `.trim();

      // Initialize conversation history with the system prompt
      const initialMessages: Message[] = [{ role: "system", content: prompt }];
      setConversationHistory(initialMessages);

      const req: APICallRequest = {
        hero,
        world,
        messages: initialMessages
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (detectEnded(data.message)) setEnded(true);
      setStory([data.message.trim()]);
      setTurnCount(1);
      
      // Add assistant's response to conversation history
      setConversationHistory(prev => [...prev, { role: "assistant", content: data.message.trim() }]);
    } catch (error) {
      console.error('Error starting story:', error);
      setStory(['Failed to start story. Please try again.']);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim() || ended) return;
    setLoading(true);

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    const userInput = input.trim();
    setInput('');

    try {
      // Add user's input to conversation history
      const updatedHistory: Message[] = [...conversationHistory, { role: "user", content: userInput }];
      setConversationHistory(updatedHistory);
      
      // Replace the send() function prompt with this enhanced narrative continuation:

    const prompt = `
This is turn ${newTurnCount} of the immersive Minecraft adventure for ${hero} in the ${world} biome.

Player just did or said: "${userInput}"

Continue the adventure following these narrative principles:
1. ACKNOWLEDGE the player's choice and show its immediate consequences
2. DEVELOP the story by either introducing a new complication, revealing information, or deepening the challenge
3. ESCALATE tension or raise the stakes in some way
4. OFFER a moment of character development, world-building, or emotional resonance

Remember that good stories maintain a rhythm between:
- Action and reflection
- Tension and relief
- Mystery and revelation

Produce ONE continuous narrative segment in second-person present tense, rich in sensory details, with character dialogue and emotional weight. Write in clear, vivid language appropriate for an intelligent ten-year-old reader.

End your reply with a natural flowing paragraph that begins with "Perhaps you could," "Maybe," or "You feel a pull to..." that seamlessly suggests 2-4 compelling next actions—without numbering, bullets, or format breaks.

DO NOT end or summarize the entire adventure yet, unless you detect the journey is truly complete with the hero returning changed from their adventure, which should conclude with **THE ADVENTURE IS OVER**.
`.trim();

      // Create a new messages array with the system prompt at the beginning
      const messages: Message[] = [
        { role: "system", content: prompt },
        ...updatedHistory.filter(msg => msg.role !== "system") // Filter out any previous system messages
      ];

      const req: APICallRequest = {
        hero,
        world,
        messages: messages
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data: APIResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant's response to conversation history
      setConversationHistory(prev => [...prev, { role: "assistant", content: data.message.trim() }]);
      
      setStory(prev => [...prev, `> ${userInput}\n`, data.message.trim()]);
      if (detectEnded(data.message)) setEnded(true);

      inputRef.current?.focus();
    } catch (error: unknown) { // Using unknown to avoid using any
      console.error('Error during chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStory(prev => [...prev, `Error during chat: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setEnded(false);
    setStory([]);
    setTurnCount(0);
    setConversationHistory([]); // Clear conversation history
    startStory();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading) send();
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-[#222] px-2">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col px-6 py-4 relative">

        {/* TOP LEFT button */}
        <Link
          href="/"
          className="mb-4 self-start inline-block px-4 py-2 bg-[#4a7a46] text-white border-2 border-[#69aa64] hover:bg-[#3b8f3e] text-sm font-bold uppercase tracking-wider"
        >
          ← Choose your next adventure
        </Link>

        <h1 className="text-4xl font-bold text-[#55FF55] text-center mb-4 drop-shadow font-mono">
          MINECRAFT ADVENTURE
        </h1>

        <div className="text-center mb-3">
          <span className="bg-[#3A3A3A] text-white px-4 py-2 inline-block border-2 border-[#1D1D1D] font-mono">
            Turn: {turnCount}
          </span>
        </div>

        <div
          className="flex-1 overflow-y-auto border border-[#444] rounded bg-[#1D1D1D] mb-3 shadow-inner"
          style={{ padding: "2rem 4rem" }}
        >
          {story.map((block, idx) => (
            <p
              key={idx}
              className={`whitespace-pre-wrap leading-relaxed mb-4 ${
                block.startsWith('>') ? 'text-[#FFAA00] font-semibold' : 'text-[#E8E8E8]'
              }`}
            >
              {block}
            </p>
          ))}

          {loading && <p className="italic text-[#AAAAAA]">Loading...</p>}

          {ended && (
            <div className="font-bold text-center text-[#FF5555] my-6 py-3 border-t-2 border-b-2 border-[#FF5555]">
              🎉 The Adventure is Over! 🎉
            </div>
          )}
        </div>

        {!ended ? (
          <div className="flex gap-2 mt-auto relative z-10 w-full">
            <input
              ref={inputRef}
              className="mc-input flex-grow p-4 rounded focus:border-[#FFAA00] outline-none"
              placeholder="Type your next action..."
              value={input}
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              disabled={loading}
              onClick={send}
              className="px-5 py-3 rounded font-bold text-white bg-[#4a7a46] border-2 border-[#69aa64] hover:bg-[#3b8f3e] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <button
              onClick={restart}
              className="px-8 py-3 rounded bg-[#4a7a46] text-white font-bold border-2 border-[#69aa64] hover:bg-[#3b8f3e]"
            >
              New Adventure
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

// Main component with Suspense boundary
export default function AdventurePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#222]">
      <div className="text-white text-xl">Loading adventure...</div>
    </div>}>
      <AdventureContent />
    </Suspense>
  );
}