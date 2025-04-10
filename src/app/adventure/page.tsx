"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { APIResponse, APICallRequest } from "@/types/adventure";

export default function AdventurePage() {
  const params = useSearchParams();

  const hero = params.get("hero") || "Steve";
  const world = params.get("world") || "Overworld";

  const [story, setStory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  useEffect(() => {
    if (story.length === 0) startStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function detectEnded(text: string): boolean {
    return /adventure (is)? over/i.test(text);
  }

  async function startStory() {
    setLoading(true);
    try {
        const prompt = `
You are narrating an interactive Minecraft adventure inspired by Choose Your Own Adventure books.

The player is called ${hero} and is exploring the ${world} biome.

At **every turn**, your reply **MUST INCLUDE TWO PARTS:**

---

**PART 1: STORY**

Write a vivid story segment in second person ("you") and present tense, using UK English.  
Include immersive detail, challenges, surprises, danger, setbacks, discoveries, and natural character dialogue.  
Keep the story engaging with twists and tension.  

---

**PART 2: SUGGESTED ACTIONS**

Finish with **a paragraph** that begins with phrases like 

"You might", or  
"Perhaps you", or  
"Possible next moves include"

and then **suggest 2 to 4 natural next actions the player might try**, embedded smoothly as part of that sentence or paragraph.  
Do **NOT** number or bullet these options.  
Do **NOT** output them as a list.  
This paragraph must **sound natural**.

---

**Additional rules:**

- Do **NOT** end or conclude the story quickly.  
- Keep the adventure exciting and ongoing across many turns.  
- Only after many rounds, if the player truly completes the adventure, then write **THE ADVENTURE IS OVER**.

---

Begin now with the **opening scene** following this exact two-part format.
`.trim();


      const req: APICallRequest = {
        messages: [{ role: "system", content: prompt }],
        hero,
        world,
      };

      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      const data: APIResponse = await response.json();

      if (detectEnded(data.message)) setEnded(true);
      setStory([data.message.trim()]);
      setTurnCount(1);
    } catch {
      setStory(["Failed to start story."]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim() || ended) return;
    setLoading(true);
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    try {
      const prompt = `
This is turn ${newTurnCount} of our ongoing Minecraft adventure with ${hero} in the ${world}.

Player just did: "${input}".

Continue the interactive Minecraft adventure. Remember that at EVERY turn, your reply MUST include the TWO PARTS format:

---

**PART 1: STORY**
Write a vivid story segment narrating what happens based on the player's action.
Write in second person ("you") and present tense, using UK English.
Include immersive detail, challenges, surprises, danger, setbacks, discoveries, and natural character dialogue.
Keep the story engaging with twists and tension.

---

**PART 2: SUGGESTED ACTIONS**
Finish with a paragraph that begins with phrases like "You might", "Perhaps you", or "Possible next moves include"
and then suggest 2 to 4 natural next actions the player might try, embedded smoothly as part of that paragraph.
Do NOT number or bullet these options.
Do NOT output them as a list.
This paragraph must sound natural.

---

**Additional rules:**
- Do NOT end or conclude the story quickly.
- Keep the adventure exciting and ongoing across many turns.
- This is only turn ${newTurnCount}, so the adventure should continue with new challenges and discoveries.
- Only after at least 10 rounds, if the player truly completes a major adventure goal, then write **THE ADVENTURE IS OVER**.
`;
      const req: APICallRequest = {
        messages: [{ role: "system", content: prompt }],
      };

      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      const data: APIResponse = await response.json();
      setStory(prev => [...prev, `> ${input}\n`, data.message.trim()]);
      setInput("");
      if (detectEnded(data.message)) setEnded(true);
    } catch {
      setStory(prev => [...prev, "Error during chat."]);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStory([]);
    setEnded(false);
    setTurnCount(0);
    startStory();
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex flex-col flex-grow px-6 sm:px-10 md:px-16">

        <h1 className="text-3xl font-bold text-green-400 text-center my-6 drop-shadow-lg font-mono">
          Minecraft Adventure
        </h1>
        
        <div className="text-center mb-4">
          <span className="bg-green-800 text-white px-3 py-1 rounded-full text-sm">
            Turn: {turnCount}
          </span>
        </div>

        <div className="flex-1 mb-4 overflow-y-auto rounded-lg border-4 border-green-700 p-4 bg-gray-900 shadow-lg">
          {story.map((block, idx) => (
            <p key={idx} className="mb-4 whitespace-pre-wrap leading-relaxed">{block}</p>
          ))}
          {loading && <p className="italic text-gray-400">Loading...</p>}
          {ended && (
            <p className="font-bold text-center text-red-400 mb-4">🎉 The Adventure is Over! 🎉</p>
          )}
        </div>

        {!ended && (
          <div className="flex gap-2 mb-6">
            <input
              className="flex-grow p-2 rounded bg-gray-800 border border-gray-600 text-white"
              placeholder="Type your next action..."
              value={input}
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 font-bold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}

        {ended && (
          <div className="flex justify-center mt-4 mb-6">
            <button
              onClick={restart}
              className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 font-bold shadow-md"
            >
              Restart
            </button>
          </div>
        )}

      </div>
    </main>
  );
}