'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import type { APIResponse, APICallRequest } from '@/types/adventure';
import { 
  useNarrativeEngine, 
  loadNarrativeData, 
  NarrativeData, 
  GameMechanics 
} from '@/lib/narrative-engine';

type MessageRole = "user" | "assistant" | "system";

interface Message {
  role: MessageRole;
  content: string;
}

interface Storyline {
  id: string;
  name: string;
  description: string;
  inspirations?: string[];
  specialFeatures?: {
    mainGoal?: string;
    majorCharacters?: string[];
    specialItems?: string[];
    specialEncounters?: string[];
    [key: string]: unknown;
  };
}

// Progress Bar Component
function ProgressBar({ percent, phase }: { percent: number, phase: string }) {
  return (
    <div className="mb-3 w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#5a5a5a]">Adventure Progress</span>
        <span className="text-xs text-[#5a5a5a]">{percent}%</span>
      </div>
      <div className="w-full bg-[#d9d2bc] h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#7b9e67]" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="text-xs text-[#5a5a5a] mt-1 italic">Current Phase: {phase}</div>
    </div>
  );
}

// Create a separate component that uses useSearchParams
function AdventureContent() {
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const storyContainerRef = useRef<HTMLDivElement>(null);

  const hero = params.get('hero') || 'Steve';
  const world = params.get('world') || 'Overworld';
  const storylineId = params.get('storyline') || 'classic_adventure';

  const [story, setStory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [narrativeData, setNarrativeData] = useState<NarrativeData | null>(null);
  const [storylineData, setStorylineData] = useState<Storyline | null>(null);
  const [storyProgress, setStoryProgress] = useState({
    currentPhase: "Not started",
    totalTurns: 0,
    progressPercent: 0,
    isNearingEnd: false
  });

  // Load narrative data
  useEffect(() => {
    async function fetchNarrativeData() {
      try {
        const data = await loadNarrativeData();
        setNarrativeData(data);

        // Also fetch storyline data
        const storylineResponse = await fetch('/api/storylines');
        if (storylineResponse.ok) {
          const storylinesData = await storylineResponse.json();
          const selectedStoryline = storylinesData.storylines.find(
            (s: Storyline) => s.id === storylineId
          ) || storylinesData.storylines[0];
          
          setStorylineData(selectedStoryline);
        }
      } catch (error) {
        console.error("Failed to load narrative data:", error);
      }
    }
    fetchNarrativeData();
  }, [storylineId]);

  // Default fallback mechanics
  const defaultMechanics: GameMechanics = {
    adventureMechanics: {},
    fightingFantasyElements: {}
  };

  // Always call useNarrativeEngine, but with fallback empty objects if data isn't loaded yet
  const narrativeEngine = useNarrativeEngine(
    hero,
    world,
    narrativeData?.narrativeStructure || { narrativeArcs: [] },
    narrativeData?.worldEncounters || { worlds: {} },
    narrativeData?.characterArchetypes?.heroArchetypes || {},
    narrativeData?.characterArchetypes?.npcArchetypes || [],
    narrativeData?.mechanics || defaultMechanics
  );

  useEffect(() => {
    if (narrativeData && storylineData && story.length === 0) startStory();
    setTimeout(() => inputRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrativeData, storylineData]);

  // Auto-scroll to bottom when story updates
  useEffect(() => {
    if (storyContainerRef.current) {
      storyContainerRef.current.scrollTop = storyContainerRef.current.scrollHeight;
    }
  }, [story]);

  function detectEnded(text: string) {
    return /adventure (is)? over/i.test(text);
  }

  async function startStory() {
    setLoading(true);
    try {
      // Add storyline-specific elements to the prompt
      const storylinePrompt = storylineData?.specialFeatures ? `
      This adventure follows the style of "${storylineData.name}" which is inspired by the classic gamebook "${storylineData.inspirations?.[0] || 'Fighting Fantasy'}".

      MAIN GOAL: ${storylineData.specialFeatures.mainGoal || 'Complete your adventure successfully'}

      KEY CHARACTERS TO POTENTIALLY INCLUDE:
      ${storylineData.specialFeatures.majorCharacters?.map(char => `- ${char}`).join('\n') || 'Various NPCs appropriate to the setting'}

      SPECIAL ITEMS THAT MIGHT APPEAR:
      ${storylineData.specialFeatures.specialItems?.map(item => `- ${item}`).join('\n') || 'Various items appropriate to the setting'}

      SPECIAL ENCOUNTER IDEAS:
      ${storylineData.specialFeatures.specialEncounters?.map(encounter => `- ${encounter}`).join('\n') || 'Various encounters appropriate to the setting'}
      ` : '';

      // Enhanced narrative prompt with guidance from the narrative engine
      const basePrompt = `
      You are crafting an epic, immersive Minecraft adventure for a brave hero named ${hero} exploring the mysterious ${world} biome.

      ${storylinePrompt}

      Follow this narrative structure to create a compelling beginning:

      1. OPENING IMAGE (First paragraph): Begin with a brief, peaceful moment showing the hero's normal life in their home village or base. Show a glimpse of their personality, skills, and everyday routine.

      2. SET-UP (Second paragraph): Establish the world around them - describe the village, the people, or environment that represents "normal" for the hero. Hint at something that's missing in their life or a skill they're known for.

      3. CATALYST/INCITING INCIDENT (Third paragraph): Introduce a disruption that shatters the equilibrium - perhaps a mysterious traveler arrives with news, a monster attack begins, a strange object is discovered, or an unusual weather event occurs.

      4. CALL TO ACTION (Fourth paragraph): Present the hero with a clear invitation to adventure - someone asks for help, they discover a map, they witness something that demands investigation, or they're chosen for a special task.

      Write in second-person present tense (UK English), full of sensory details, emotion, and character dialogue. The language should be vibrant but suitable for an intelligent ten-year-old, with clear words, short punchy sentences mixed with occasional longer, flowing ones.

      For emphasis, instead of using asterisks (*) or underscores (_), use UPPERCASE WORDS sparingly for important elements.

      End your response with a natural flowing paragraph suggesting 2-4 possible next actions that would represent the hero's CROSSING THE THRESHOLD into adventure. Begin this paragraph with phrases like "You might consider," "Perhaps you could," or "You feel drawn to" - these suggestions must be woven seamlessly into the narrative without numbering or bullet points.

      As the adventure continues beyond this opening, regularly introduce new characters with distinct personalities, moral choices, revelations, and plot twists that balance danger with opportunity.

      Begin NOW with this cinematically structured opening that establishes normalcy and then disrupts it with a compelling call to adventure. DO NOT include subheadings or summaries. Write in a single continuous narrative segment.
      `.trim();

      // Get enhanced prompt with narrative guidance
      const enhancedPrompt = narrativeEngine.enhancePrompt(basePrompt);

      // Initialize conversation history with the system prompt
      const initialMessages: Message[] = [{ role: "system", content: enhancedPrompt }];
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

      // Update story progress through narrative engine
      const progress = narrativeEngine.advanceNarrative("", data.message.trim());
      setStoryProgress(progress);
    } catch (error) {
      console.error('Error starting story:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while starting the story';
      setStory(['Failed to start story: ' + errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim() || ended || loading) return;
    setLoading(true);

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    const userInput = input.trim();
    setInput('');

    try {
      // Add user's input to conversation history
      const updatedHistory: Message[] = [...conversationHistory, { role: "user", content: userInput }];
      setConversationHistory(updatedHistory);
      
      // Add storyline-specific prompting for continuation
      const storylinePrompt = storylineData?.specialFeatures ? `
      Remember this adventure follows the style of "${storylineData.name}" inspired by "${storylineData.inspirations?.[0] || 'Fighting Fantasy'}".
      
      MAIN GOAL: ${storylineData.specialFeatures.mainGoal}
      
      Keep building toward this goal with appropriate encounters, characters, and items from this adventure style.
      ` : '';
      
      const basePrompt = `
This is turn ${newTurnCount} of the immersive Minecraft adventure for ${hero} in the ${world} biome.

${storylinePrompt}

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

      // Enhance with narrative guidance
      const enhancedPrompt = narrativeEngine.enhancePrompt(basePrompt);

      // Create a new messages array with the system prompt at the beginning
      const messages: Message[] = [
        { role: "system", content: enhancedPrompt },
        ...updatedHistory.filter(msg => msg.role !== "system") // Filter out any previous system messages
      ];

      const req: APICallRequest = {
        hero,
        world,
        messages: messages
      };

      // Show user input immediately
      setStory(prev => [...prev, `> ${userInput}\n`]);

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
      
      // Add the AI response to the story
      setStory(prev => [...prev, data.message.trim()]);
      if (detectEnded(data.message)) setEnded(true);

      // Update story progress through narrative engine
      const progress = narrativeEngine.advanceNarrative(userInput, data.message.trim());
      setStoryProgress(progress);

      inputRef.current?.focus();
    } catch (error) {
      console.error('Error during chat:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
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
    setStoryProgress({
      currentPhase: "Introduction",
      totalTurns: 0,
      progressPercent: 0,
      isNearingEnd: false
    });
    startStory();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading) send();
  }

  // Format story text with highlighted suggestions
  const formatStoryText = (text: string) => {
    if (!text) return text;
    
    // Check if the text contains suggestion phrases
    const suggestions = [
      "You might consider", 
      "Perhaps you could", 
      "Maybe you can",
      "You feel drawn to",
      "You feel a pull to",
      "Possible moves include"
    ];
    
    for (const phrase of suggestions) {
      if (text.includes(phrase)) {
        // Find the index where the suggestion starts
        const index = text.indexOf(phrase);
        // Split the text into two parts
        const mainText = text.substring(0, index);
        const suggestionText = text.substring(index);
        
        return (
          <>
            <span>{mainText}</span>
            <div className="suggestions-container mt-6 mb-2 p-4 border-l-4 border-[#7b9e67] bg-[#f0ece0]">
              <h4 className="font-bold text-[#4a623e] mb-2">Options:</h4>
              <p className="text-[#333] italic">{suggestionText}</p>
            </div>
          </>
        );
      }
    }
    
    return text;
  };

  return (
    <main className="min-h-screen bg-[#f5f5dc] text-[#333]">
      <div className="container mx-auto max-w-5xl flex flex-col min-h-screen">
        {/* Header with title and back button */}
        <header className="py-4 border-b border-[#e5dcc3] flex items-center justify-between">
          <Link
            href="/"
            className="bg-[#7b9e67] text-white py-2 px-4 rounded-md tracking-wide uppercase text-sm hover:bg-[#4a623e] transition-colors shadow-sm"
          >
            ← New Adventure
          </Link>
          
          <h1 className="text-[#4a623e] text-3xl font-serif">
            Minecraft Adventure
          </h1>
          
          <div className="text-[#5a5a5a]">
            Turn {turnCount}
          </div>
        </header>
        
        {/* Adventure info bar - simplified with increased spacing */}
        <div className="flex justify-center py-3 text-sm border-b border-[#e5dcc3]">
          <div className="px-6">
            Hero: <span className="text-[#7b5427] font-medium">{hero}</span>
          </div>
          <div className="px-6">
            World: <span className="text-[#4a623e] font-medium">{world}</span>
          </div>
          
          {/* Storyline info - simplified with increased spacing */}
          {storylineData && (
            <div className="px-6">
              <span className="text-[#4a4a6e] font-medium">{storylineData.name}</span>
              {storylineData.inspirations && (
                <span className="text-[#5a5a5a] text-xs italic ml-2">Inspired by: {storylineData.inspirations[0]}</span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar in a container with proper margins */}
        <div className="px-4 py-2">
          <ProgressBar 
            percent={storyProgress.progressPercent} 
            phase={storyProgress.currentPhase} 
          />
        </div>

        {/* Story container - paper-like appearance with ample margins */}
        <div
          ref={storyContainerRef}
          className="flex-1 overflow-y-auto bg-[#fffcf0]"
        >
          {/* Content with generous margins */}
          <div className="max-w-3xl mx-auto py-8 px-16">
            {story.map((block, idx) => (
              <div key={idx} className="mb-6">
                {block.startsWith('>') ? (
                  <div className="my-4">
                    <div className="bg-[#f0ece0] py-2 px-4 border-l-4 border-[#7b9e67]">
                      <p>
                        <span className="font-medium text-[#4a623e]">You decide to:</span> {block.substring(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {formatStoryText(block)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#7b9e67] border-t-transparent rounded-full animate-spin"></div>
                <p className="italic text-[#757575] mt-2">The adventure continues...</p>
              </div>
            )}

            {ended && (
              <div className="text-center my-8 py-6">
                <div className="font-bold text-2xl mb-4 bg-[#f0d78a] text-[#7b5427] py-3 px-6 inline-block transform -rotate-1 border-2 border-[#e0c77a]">
                  🎉 THE ADVENTURE IS OVER! 🎉
                </div>
                <p className="text-[#757575] italic mt-4">Your journey has reached its conclusion. What an adventure!</p>
                <div className="w-16 h-16 mx-auto mt-6 bg-[#7b5427] rounded-sm relative">
                  <div className="absolute inset-2 bg-[#8b6437] opacity-60"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        {!ended ? (
          <div className="p-4 border-t border-[#e5dcc3] flex gap-2">
            <input
              ref={inputRef}
              className="flex-grow p-3 bg-[#fffcf0] border border-[#e5dcc3] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7b9e67] focus:border-transparent"
              placeholder="What will you do next...?"
              value={input}
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              disabled={loading}
              onClick={send}
              className="bg-[#7b9e67] text-white py-2 px-6 rounded-md hover:bg-[#4a623e] transition-colors shadow-sm"
            >
              {loading ? '...' : 'SEND'}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-[#e5dcc3] flex justify-center">
            <button
              onClick={restart}
              className="bg-[#7b9e67] text-white py-3 px-8 text-lg rounded-md hover:bg-[#4a623e] transition-colors shadow-sm"
            >
              Start New Adventure
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5dc]">
        <h1 className="text-3xl font-bold mb-6 text-[#4a623e]">MINECRAFT ADVENTURE</h1>
        <div className="inline-block w-16 h-16 border-4 border-[#7b9e67] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl mt-6 text-[#333]">Preparing your adventure...</div>
      </div>
    }>
      <AdventureContent />
    </Suspense>
  );
}