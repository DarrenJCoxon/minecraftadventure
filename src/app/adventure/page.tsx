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
  const [loadingDots, setLoadingDots] = useState('...');

  // Animate loading dots
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots(dots => dots === '...' ? '.' : dots === '.' ? '..' : '...');
      }, 400);
      return () => clearInterval(interval);
    }
  }, [loading]);

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

  // FIXED: Function to break text into reasonable paragraphs
  function breakIntoParagraphs(text: string): string {
    if (!text) return text;
    
    // If the text already has paragraphs (via newlines), respect them
    if (text.includes('\n\n')) {
      return text;
    }
    
    // If the text is short, return as is
    if (text.length < 400) {
      return text;
    }
    
    // Split by existing single newlines first
    const initialSplit = text.split(/\n/);
    
    // Process each existing paragraph
    const result = initialSplit.map(paragraph => {
      // Skip short paragraphs or user inputs that start with >
      if (paragraph.trim().length < 250 || paragraph.trim().startsWith('>')) {
        return paragraph;
      }
      
      // Split into sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      // Group sentences into reasonable paragraphs (4-5 sentences per paragraph)
      const newParagraphs = [];
      let currentParagraph = '';
      
      for (const sentence of sentences) {
        if (currentParagraph.length + sentence.length > 350) {
          newParagraphs.push(currentParagraph.trim());
          currentParagraph = sentence;
        } else {
          currentParagraph += sentence;
        }
      }
      
      if (currentParagraph.trim()) {
        newParagraphs.push(currentParagraph.trim());
      }
      
      // Join with single newlines, not double
      return newParagraphs.join('\n');
    });
    
    // Join with single newlines, not double
    return result.join('\n');
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
      // Apply paragraph breaking to the response
      setStory([breakIntoParagraphs(data.message.trim())]);
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
      
      // Apply paragraph breaking to the response and add it to the story
      setStory(prev => [...prev, breakIntoParagraphs(data.message.trim())]);
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
            <div className="adventure-options">
              <div className="adventure-options-header">
                <div className="adventure-options-square"></div>
                <h4 className="adventure-options-text">Options:</h4>
              </div>
              <p>{suggestionText}</p>
            </div>
          </>
        );
      }
    }
    
    return text;
  };

  // Get hero block icon
  const getHeroBlock = () => {
    switch(hero) {
      case 'Steve': return <div className="minecraft-block" style={{backgroundColor: "#F9C49A", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      case 'Alex': return <div className="minecraft-block" style={{backgroundColor: "#F9AA7C", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      case 'Zombie': return <div className="minecraft-block" style={{backgroundColor: "#529456", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      case 'Skeleton': return <div className="minecraft-block" style={{backgroundColor: "#C6C6C6", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      default: return <div className="minecraft-block" style={{backgroundColor: "#F9C49A", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
    }
  };

  // Get world block icon
  const getWorldBlock = () => {
    switch(world) {
      case 'Overworld': return <div className="minecraft-block-grass" style={{width: "24px", height: "24px", marginRight: "8px"}}></div>;
      case 'Nether': return <div className="minecraft-block" style={{backgroundColor: "#B02E26", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      case 'The End': return <div className="minecraft-block" style={{backgroundColor: "#2A193E", border: "2px solid #555", width: "24px", height: "24px", marginRight: "8px"}}></div>;
      default: return <div className="minecraft-block-grass" style={{width: "24px", height: "24px", marginRight: "8px"}}></div>;
    }
  };

  // Get storyline info
  const getStorylineInfo = () => {
    if (!storylineData) return { name: "Classic Adventure", inspiration: null };
    
    return {
      name: storylineData.name,
      inspiration: storylineData.inspirations?.[0] || null
    };
  };

  const storylineInfo = getStorylineInfo();

  return (
    <main className="min-h-screen minecraft-bg">
      <div className="container mx-auto max-w-5xl flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-black bg-opacity-60 border-b-[3px] border-[#636363]">
          {/* Title and back button */}
          <div className="py-4 flex items-center justify-between px-6">
            <Link
              href="/"
              className="minecraft-button text-sm px-4 py-2"
            >
              ← NEW ADVENTURE
            </Link>
            
            <h1 className="minecraft-title text-2xl md:text-3xl">
              MINECRAFT ADVENTURE
            </h1>
            
            <div className="text-white text-xl md:text-2xl">
              Turn {turnCount}
            </div>
          </div>
          
          {/* Adventure info bar */}
          <div className="flex justify-center py-4 px-6 border-t-[3px] border-[#636363] bg-black bg-opacity-40 flex-wrap">
            <div className="px-6 py-2 mx-2 flex items-center">
              {getHeroBlock()}
              <span className="text-[#AAAAAA] mr-1">Hero:</span>
              <span className="text-white font-bold">{hero}</span>
            </div>
            
            <div className="px-6 py-2 mx-2 flex items-center">
              {getWorldBlock()}
              <span className="text-[#AAAAAA] mr-1">World:</span>
              <span className="text-white font-bold">{world}</span>
            </div>
            
            {storylineInfo && (
              <div className="px-6 py-2 mx-2 flex items-center">
                <div className="minecraft-block-stone" style={{width: "24px", height: "24px", marginRight: "8px"}}></div>
                <span className="text-white font-bold">{storylineInfo.name}</span>
                {storylineInfo.inspiration && (
                  <span className="text-[#AAAAAA] text-sm ml-2 italic">Inspired by: {storylineInfo.inspiration}</span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#555555] mr-2"></div>
                <span className="text-base md:text-lg font-bold text-[#44bd32] uppercase">Adventure Progress</span>
              </div>
              <div className="bg-[#44bd32] px-3 py-1 text-white text-base font-bold">
                {storyProgress.progressPercent}%
              </div>
            </div>
            
            <div className="w-full h-6 border-4 border-black overflow-hidden bg-[#c6c6c6]">
              <div 
                className="h-full bg-[#44bd32]" 
                style={{ 
                  width: `${storyProgress.progressPercent}%`,
                  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)",
                  backgroundSize: "20px 20px"
                }}
              ></div>
            </div>
            
            <div className="flex items-center mt-3">
              <div className="w-3 h-3 bg-[#555555] mr-2"></div>
              <span className="text-base md:text-lg font-bold text-[#44bd32] uppercase">Current Quest: {storyProgress.currentPhase}</span>
            </div>
          </div>
        </div>

        {/* Story container */}
        <div
          ref={storyContainerRef}
          className="flex-1 overflow-y-auto bg-black bg-opacity-60 border-t-[3px] border-[#636363]"
        >
          {/* Content */}
          <div className="story-container">
            {story.map((block, idx) => (
              <div key={idx} className="mb-8">
                {block.startsWith('>') ? (
                  <div className="my-6">
                    <div className="border-l-4 border-[#44bd32] bg-black bg-opacity-80 p-4">
                      <p className="text-white text-xl">
                        <span className="font-bold text-[#44bd32]">You decide to:</span> {block.substring(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="adventure-text whitespace-pre-line">
                      {formatStoryText(block)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-block w-16 h-16 border-4 border-[#44bd32] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#555555] mt-4 text-xl">
                  {turnCount === 0 ? "Your adventure awaits" : "Your adventure continues"}{loadingDots}
                </p>
              </div>
            )}

            {ended && (
              <div className="text-center my-12 py-8">
                <div className="font-bold text-3xl mb-6 bg-[#44bd32] text-white py-4 px-8 inline-block border-4 border-black">
                  🎉 THE ADVENTURE IS OVER! 🎉
                </div>
                <p className="text-[#555555] mt-6 text-xl">Your journey has reached its conclusion. What an adventure!</p>
                <div className="flex justify-center gap-10 mt-10">
                  <div className="minecraft-block-dirt" style={{width: "50px", height: "50px"}}></div>
                  <div className="minecraft-block-grass" style={{width: "50px", height: "50px"}}></div>
                  <div className="minecraft-block-stone" style={{width: "50px", height: "50px"}}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        {!ended ? (
        <div className="p-6 bg-black bg-opacity-80 border-t-[3px] border-[#636363] flex gap-3">
          <input
            ref={inputRef}
            className="flex-grow p-4 bg-[#c6c6c6] border-3 border-[#555555] text-[#111] text-4xl font-['VT323'] focus:outline-none focus:border-[#44bd32] adventure-input"
            placeholder="What will you do next?"
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            disabled={loading}
            onClick={send}
            className="minecraft-button text-2xl px-8"
          >
            {loading ? '...' : 'SEND'}
          </button>
        </div>
      ) : (
        <div className="p-6 bg-black bg-opacity-80 border-t-[3px] border-[#636363] flex justify-center">
          <button
            onClick={restart}
            className="minecraft-button text-xl px-10 py-4"
          >
            NEW ADVENTURE
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
      <div className="flex flex-col items-center justify-center min-h-screen minecraft-bg">
        <h1 className="minecraft-title text-4xl mb-8">MINECRAFT ADVENTURE</h1>
        <div className="inline-block w-20 h-20 border-4 border-[#44bd32] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-2xl mt-8 text-white">Preparing your adventure...</div>
      </div>
    }>
      <AdventureContent />
    </Suspense>
  );
}