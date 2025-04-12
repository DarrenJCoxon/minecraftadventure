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

// Decorative Minecraft Block Component
function MinecraftBlock({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={`absolute w-16 h-16 shadow-lg opacity-80 ${className || ''}`}
      style={style}
    ></div>
  );
}

// Progress Bar Component
function ProgressBar({ percent, phase }: { percent: number, phase: string }) {
  return (
    <div className="mb-4 w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#AAAAAA]">Adventure Progress</span>
        <span className="text-xs text-[#AAAAAA]">{percent}%</span>
      </div>
      <div className="w-full bg-[#333] h-3 rounded-sm overflow-hidden border border-[#555]">
        <div 
          className="h-full bg-[#55FF55]" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="text-xs text-[#AAAAAA] mt-1 italic">Current Phase: {phase}</div>
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

  const [story, setStory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [narrativeData, setNarrativeData] = useState<NarrativeData | null>(null);
  const [storyProgress, setStoryProgress] = useState({
    currentPhase: "Introduction",
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
      } catch (error) {
        console.error("Failed to load narrative data:", error);
      }
    }
    fetchNarrativeData();
  }, []);

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
    if (narrativeData && story.length === 0) startStory();
    setTimeout(() => inputRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrativeData]);

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
      // Enhanced narrative prompt with guidance from the narrative engine
      const basePrompt = `
      You are crafting an epic, immersive Minecraft adventure for a brave hero named ${hero} exploring the mysterious ${world} biome.

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
      
      const basePrompt = `
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

  // Function to determine background color based on world
  const getWorldBgClass = () => {
    switch(world) {
      case 'Nether':
        return 'bg-gradient-to-b from-red-800 to-red-950';
      case 'The End':
        return 'bg-gradient-to-b from-purple-800 to-purple-950';
      case 'Ice Plains':
        return 'bg-gradient-to-b from-blue-800 to-blue-950';
      case 'Desert Temple':
        return 'bg-gradient-to-b from-yellow-700 to-yellow-900';
      case 'Jungle':
        return 'bg-gradient-to-b from-green-700 to-green-900';
      default:
        return 'bg-gradient-to-b from-[#222] to-[#111]';
    }
  };

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
            <span className="suggestion-text block mt-4">{suggestionText}</span>
          </>
        );
      }
    }
    
    return text;
  };

  return (
    <main className={`min-h-screen flex justify-center items-center ${getWorldBgClass()} px-2 relative overflow-hidden`}>
      {/* Decorative Minecraft Blocks */}
      <MinecraftBlock 
        className="floating-block-1 bg-[#7b5d3f]" 
        style={{ top: '10%', left: '10%', transform: 'rotate(-6deg)' }} 
      />
      <MinecraftBlock 
        className="floating-block-2 bg-[#5d8a57]" 
        style={{ bottom: '15%', right: '8%', transform: 'rotate(12deg)' }} 
      />
      <MinecraftBlock 
        className="floating-block-3 bg-[#737373]" 
        style={{ top: '25%', right: '15%', transform: 'rotate(3deg)' }} 
      />
      
      {/* Pixel grid background overlay */}
      <div className="absolute inset-0 w-full h-full pixel-bg opacity-30"></div>
      
      <div className="w-full max-w-3xl h-[90vh] flex flex-col px-6 py-4 relative z-10">
        {/* Header with back button and title */}
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="btn-3d bg-[#4a7a46] hover:bg-[#3b8f3e] transition-all text-sm uppercase tracking-wider px-4 py-2 flex items-center"
          >
            <span className="mr-1">←</span> New Adventure
          </Link>
          
          <div className="turn-badge">
            Turn {turnCount}
          </div>
        </div>

        <h1 className="adventure-title mb-4">
          MINECRAFT ADVENTURE
        </h1>
        
        <div className="flex justify-center gap-2 mb-3">
          <div className="bg-[#3A3A3A] text-white px-4 py-2 inline-block border-2 border-[#1D1D1D] font-mono">
            Hero: <span className="text-[#FFAA00]">{hero}</span>
          </div>
          <div className="bg-[#3A3A3A] text-white px-4 py-2 inline-block border-2 border-[#1D1D1D] font-mono">
            World: <span className="text-[#55FF55]">{world}</span>
          </div>
        </div>

        {/* Progress Bar - New component */}
        <ProgressBar 
          percent={storyProgress.progressPercent} 
          phase={storyProgress.currentPhase} 
        />

        {/* Story container with improved scrolling and styling */}
        <div
          ref={storyContainerRef}
          className="flex-1 overflow-y-auto border border-[#444] rounded bg-[#1D1D1D] mb-3 shadow-inner mc-scrollbar relative"
          style={{ padding: "2rem 4rem" }}
        >
          {story.map((block, idx) => (
            <div key={idx} className="mb-6">
              {block.startsWith('>') ? (
                <div className="player-speech ml-4 mb-4">
                  {block.substring(2)}
                </div>
              ) : (
                <p className="story-text whitespace-pre-wrap leading-relaxed text-[#E8E8E8]">
                  {formatStoryText(block)}
                </p>
              )}
            </div>
          ))}

          {loading && (
            <div className="mt-4">
              <div className="mc-loading mb-2"></div>
              <p className="italic text-[#AAAAAA] text-center">The adventure continues...</p>
            </div>
          )}

          {ended && (
            <div className="text-center my-8 py-6">
              <div className="font-bold text-[#FF5555] text-2xl mb-4 gold-bg py-3 px-6 inline-block transform -rotate-2">
                🎉 THE ADVENTURE IS OVER! 🎉
              </div>
              <p className="text-[#AAAAAA] italic mt-4">Your journey has reached its conclusion. What an adventure!</p>
              <div className="crafting-table mt-8"></div>
            </div>
          )}
        </div>

        {/* Input area with better styling */}
        {!ended ? (
          <div className="flex gap-2 mt-auto relative z-10 w-full">
            <input
              ref={inputRef}
              className="mc-input flex-grow p-4 rounded focus:border-[#FFAA00] outline-none text-lg"
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
              className="btn-3d min-w-[100px] text-white font-bold disabled:opacity-50"
            >
              {loading ? '...' : 'SEND'}
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <button
              onClick={restart}
              className="emerald-button px-8 py-3 text-xl"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#222]">
        <h1 className="text-[#55FF55] text-3xl font-bold mb-6">MINECRAFT ADVENTURE</h1>
        <div className="mc-loading w-64"></div>
        <div className="text-white text-xl mt-6">Preparing your adventure...</div>
      </div>
    }>
      <AdventureContent />
    </Suspense>
  );
}