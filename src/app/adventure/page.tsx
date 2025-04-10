'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import type { APIResponse, APICallRequest } from '@/types/adventure';

export default function AdventurePage() {
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const hero = params.get('hero') || 'Steve';
  const world = params.get('world') || 'Overworld';

  const [story, setStory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

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
      const prompt = `
You are crafting an epic, immersive Minecraft adventure for a brave hero named ${hero} exploring the mysterious ${world} biome.

At every turn, write a *single* vivid story segment in second-person present tense (UK English), full of sensory details, emotion, danger, discovery, and character dialogue.

At the end of each story segment, write a *single* flowing paragraph using phrases like "You might consider," "Perhaps you could," or "Possible next moves include" — to *naturally* suggest 2-4 interesting next actions, woven seamlessly into the story. These suggestions **must not** be numbered or bulleted.

The story should regularly introduce new intriguing characters (with unique personalities and motivations), moral dilemmas, revelations, and plot twists, balanced between danger and opportunity.

Begin _now_ with an atmospheric opening that combines immediate danger and hints at deeper mysteries.
      `.trim();

      const req: APICallRequest = {
        hero,
        world,
        messages: [{ role: 'system', content: prompt }]
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data: APIResponse = await response.json();
      if (detectEnded(data.message)) setEnded(true);
      setStory([data.message.trim()]);
      setTurnCount(1);
    } catch {
      setStory(['Failed to start story.']);
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
      const prompt = `
This is turn ${newTurnCount} of the immersive Minecraft adventure for ${hero} in the ${world} biome.

Player just did or said: "${userInput}"

Continue telling the story in your natural, vivid style. 

DO NOT use any "part 1" or "part 2" or section titles.

Instead, produce ONE continuous narrative segment in second-person present tense, rich in detail, with character dialogue and emotional tension.

End your reply with a *natural* flowing paragraph that begins with "Perhaps you could", "Maybe", or "Possible moves include", that seamlessly suggests 2-4 compelling next actions—without numbering, bullets, or format breaks.

DO NOT end or summarize the entire adventure yet, unless you detect the journey is truly complete and should conclude with **THE ADVENTURE IS OVER**.
      `.trim();

      const req: APICallRequest = {
        hero,
        world,
        messages: [{ role: 'system', content: prompt }]
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data: APIResponse = await response.json();

      setStory(prev => [...prev, `> ${userInput}\n`, data.message.trim()]);
      if (detectEnded(data.message)) setEnded(true);

      inputRef.current?.focus();
    } catch {
      setStory(prev => [...prev, 'Error during chat.']);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setEnded(false);
    setStory([]);
    setTurnCount(0);
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
