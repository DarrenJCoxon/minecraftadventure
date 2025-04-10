'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { APIResponse, APICallRequest } from "@/types/adventure";

// Create a client component that uses the search params
function AdventureContent() {
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
You are crafting an epic, immersive Minecraft adventure for ${hero} exploring the mysterious ${world} biome. This adventure should unfold like the most thrilling interactive fiction, with rich storytelling and natural choice progression.

For each turn of this adventure, create:

A VIVID NARRATIVE SEQUENCE written in second-person present tense using British English. Your storytelling should:
- Create a richly detailed Minecraft world with environmental hazards, hidden treasures, and unexplored territories
- Include sensory details that bring the ${world} to life - its sounds, sights, textures, and atmosphere
- Introduce unexpected challenges, discoveries, and plot twists that keep players engaged
- Balance moments of tension, discovery, triumph, and setback to create emotional investment
- Incorporate Minecraft-specific elements like crafting, mining, building, and indigenous creatures

IMPORTANT: Regularly introduce mysterious characters with distinct personalities who:
- Have their own motivations that may align with or oppose the player
- Offer unexpected information, quests, warnings, or assistance
- Sometimes travel alongside the player for portions of the journey
- Might betray, surprise, or aid the player in unexpected ways
- Create moral dilemmas or difficult choices for the player
- Hint at larger mysteries or stories within the ${world} biome

After your narrative, smoothly transition to a natural paragraph of possible actions that:
- Begins with phrases like "You might consider," "Perhaps you could," or "Possible paths forward include"
- Suggests 2-4 compelling next actions woven naturally into a single flowing paragraph
- Offers genuinely different strategic or narrative options, not just slight variations
- Sometimes includes options to interact with encountered characters in different ways
- Occasionally presents morally complex choices with unclear outcomes
- NEVER uses numbering, bullets, or list formatting - keep it conversational and natural

Additional guidelines:
- Create a progressively unfolding mystery about the ${world} that reveals itself over many turns
- Include occasional surprises that fundamentally change the player's understanding of their situation
- Allow for genuine player agency - their choices should meaningfully impact the story
- Create a sense of an expansive world beyond what is immediately visible
- Balance immediate dangers with longer-term goals and mysteries
- Only conclude the adventure when the player has completed a truly epic journey of at least 15-20 turns
- When the adventure reaches its true conclusion, include "THE ADVENTURE IS OVER" in your response

Begin now with an atmospheric, intriguing opening scene that establishes both immediate danger and hints at deeper mysteries within the ${world}.
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
  );
}

// Loading fallback component
function AdventureLoading() {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center p-8">
      <div className="text-green-400 text-xl">Loading adventure...</div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AdventurePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4">
      <Suspense fallback={<AdventureLoading />}>
        <AdventureContent />
      </Suspense>
    </main>
  );
}