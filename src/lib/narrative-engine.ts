import { useState } from 'react';

// Define Message type locally instead of importing it
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Define narrative structure types 
interface NarrativePhase {
  id: string;
  name: string;
  minTurns: number;
  maxTurns: number;
  description: string;
  narrativeGoals: string[];
  requiredElements: string[];
}

interface NarrativeArc {
  id: string;
  name: string;
  description: string;
  phases: NarrativePhase[];
  totalMinimumTurns: number;
  recommendedLength: number;
}

interface NarrativeStructure {
  narrativeArcs: NarrativeArc[];
}

interface WorldEncounterElements {
  enemies?: string[];
  challenges?: string[];
  rewards?: string[];
  [key: string]: string[] | undefined;
}

interface WorldEncounter {
  id: string;
  name: string;
  description: string;
  elements: WorldEncounterElements;
  narrativeHooks: string[];
}

interface WorldLocation {
  id: string;
  name: string;
  description: string;
  elements: Record<string, unknown>;
}

interface WorldItem {
  id: string;
  name: string;
  description: string;
  powers: string[];
}

interface WorldData {
  encounters: WorldEncounter[];
  locations: WorldLocation[];
  items?: WorldItem[];
}

interface WorldEncounters {
  worlds: Record<string, WorldData>;
}

interface HeroGrowthArc {
  initialState: string;
  challenges: string[];
  potentialGrowth: string[];
}

interface HeroArchetype {
  personality: string;
  strengths: string[];
  weaknesses: string[];
  growthArc: HeroGrowthArc;
  relationshipDynamics: Record<string, string>;
}

interface NpcRelationshipDynamics {
  initialMeeting: string;
  development: string;
  "potential complications": string[];
}

interface NpcArchetype {
  id: string;
  role: string;
  description: string;
  examples: string[];
  narrativeFunction: string[];
  relationshipDynamics: NpcRelationshipDynamics;
}

interface CharacterArchetypes {
  heroArchetypes: Record<string, HeroArchetype>;
  npcArchetypes: NpcArchetype[];
}

// Export important interfaces that need to be used in other files
export interface GameMechanics {
  adventureMechanics: Record<string, unknown>;
  fightingFantasyElements: Record<string, unknown>;
}

export interface ProgressInfo {
  currentPhase: string;
  totalTurns: number;
  progressPercent: number;
  isNearingEnd: boolean;
}

// Type for narrative data loaded from JSON files
export interface NarrativeData {
  narrativeStructure: NarrativeStructure;
  worldEncounters: WorldEncounters;
  characterArchetypes: CharacterArchetypes;
  mechanics: GameMechanics;
}

// Main narrative engine class
export class NarrativeEngine {
  private narrativeStructure: NarrativeArc[];
  private worldEncounters: Record<string, WorldData>;
  private heroArchetypes: Record<string, HeroArchetype>;
  private npcArchetypes: NpcArchetype[];
  private mechanics: GameMechanics;

  // Adventure state
  private currentPhaseIndex: number = 0;
  private turnInPhase: number = 0;
  private totalTurns: number = 0;
  private activeArc: NarrativeArc | null = null;
  private storyBeats: Set<string> = new Set();
  private introducedCharacters: Set<string> = new Set();
  private inventory: string[] = [];
  private worldHints: string[] = [];

  constructor(
    narrativeStructure: NarrativeArc[],
    worldEncounters: Record<string, WorldData>,
    heroArchetypes: Record<string, HeroArchetype>,
    npcArchetypes: NpcArchetype[],
    mechanics: GameMechanics
  ) {
    this.narrativeStructure = narrativeStructure;
    this.worldEncounters = worldEncounters;
    this.heroArchetypes = heroArchetypes;
    this.npcArchetypes = npcArchetypes;
    this.mechanics = mechanics;
  }

  // Initialize the adventure
  public initializeAdventure(): NarrativeArc {
    // Pick an appropriate narrative arc
    const selectedArc = this.narrativeStructure.find(arc => arc.id === "classic_quest") || this.narrativeStructure[0];
    this.activeArc = selectedArc;
    this.currentPhaseIndex = 0;
    this.turnInPhase = 0;
    this.totalTurns = 0;
    
    return selectedArc;
  }

  // Get the current phase of the story
  public getCurrentPhase(): NarrativePhase | null {
    if (!this.activeArc) return null;
    return this.activeArc.phases[this.currentPhaseIndex];
  }

  // Advance to the next turn and possibly the next phase
  public advanceTurn(): void {
    this.turnInPhase++;
    this.totalTurns++;
    
    if (!this.activeArc) return;
    
    const currentPhase = this.getCurrentPhase();
    if (!currentPhase) return;
    
    // Check if we should move to the next phase
    if (this.turnInPhase >= currentPhase.maxTurns && 
        this.currentPhaseIndex < this.activeArc.phases.length - 1) {
      this.currentPhaseIndex++;
      this.turnInPhase = 0;
    }
  }

  // Get narrative guidance for the current turn
  public getNarrativeGuidance(hero: string, world: string): string {
    if (!this.activeArc) return "";
    
    const currentPhase = this.getCurrentPhase();
    if (!currentPhase) return "";
    
    const heroArchetype = this.heroArchetypes[hero] || this.heroArchetypes["Steve"];
    const worldData = this.worldEncounters[world] || this.worldEncounters["Overworld"];
    
    // Calculate whether we're early, middle, or late in the phase
    const phaseProgress = this.turnInPhase / currentPhase.maxTurns;
    let phaseStage = "early";
    if (phaseProgress > 0.66) phaseStage = "late";
    else if (phaseProgress > 0.33) phaseStage = "middle";
    
    // Determine if we should introduce a new character
    const shouldAddCharacter = this.turnInPhase % 3 === 0 && this.introducedCharacters.size < 5;
    
    // Determine if we should include a world-specific encounter
    const shouldAddEncounter = this.turnInPhase % 4 === 1 && this.worldHints.length < worldData.encounters.length;
    
    // Select available elements to include
    let potentialEncounter: WorldEncounter | null = null;
    if (shouldAddEncounter) {
      const unusedEncounters = worldData.encounters.filter(e => !this.worldHints.includes(e.id));
      if (unusedEncounters.length > 0) {
        potentialEncounter = unusedEncounters[Math.floor(Math.random() * unusedEncounters.length)];
        this.worldHints.push(potentialEncounter.id);
      }
    }
    
    // Build the narrative guidance prompt
    const guidance = `
    --== NARRATIVE GUIDANCE (TURN ${this.totalTurns}) ==--
    
    CURRENT PHASE: ${currentPhase.name} (${phaseStage} stage, turn ${this.turnInPhase + 1} of ${currentPhase.maxTurns})
    
    PHASE DESCRIPTION: ${currentPhase.description}
    
    NARRATIVE GOALS FOR THIS PHASE:
    ${currentPhase.narrativeGoals.map(goal => `- ${goal}`).join('\n')}
    
    HERO CONSIDERATIONS:
    - ${heroArchetype.personality}
    - Strengths: ${heroArchetype.strengths.join(', ')}
    - Weaknesses: ${heroArchetype.weaknesses.join(', ')}
    - Current state in journey: ${phaseStage === "early" ? 
        heroArchetype.growthArc.initialState : 
        "Developing and facing " + heroArchetype.growthArc.challenges[this.currentPhaseIndex % heroArchetype.growthArc.challenges.length]}
    
    WORLD ELEMENTS: ${world} biome
    ${potentialEncounter ? `
    POTENTIAL ENCOUNTER: ${potentialEncounter.name}
    ${potentialEncounter.description}
    Key elements: ${Object.entries(potentialEncounter.elements).map(([key, values]) => 
      `${key}: ${Array.isArray(values) ? values.join(', ') : values}`).join(' | ')}
    Story hooks: ${potentialEncounter.narrativeHooks.join(' | ')}
    ` : ''}
    
    ${shouldAddCharacter ? `
    CHARACTER INTRODUCTION OPPORTUNITY:
    Consider introducing a ${this.npcArchetypes[this.introducedCharacters.size % this.npcArchetypes.length].role.toLowerCase()} character.
    This type of character serves to: ${this.npcArchetypes[this.introducedCharacters.size % this.npcArchetypes.length].narrativeFunction.join(', ')}
    Example: ${this.npcArchetypes[this.introducedCharacters.size % this.npcArchetypes.length].examples[0]}
    ` : ''}
    
    FIGHTING FANTASY ELEMENTS:
    - Consider incorporating a skill check or challenge that tests the hero's abilities
    - Include meaningful choices with consequences
    - Balance combat, exploration, and social interactions
    - Create opportunities for resource management (food, tools, etc.)
    
    PACING GUIDANCE:
    - Total story progress: ~${Math.floor((this.totalTurns / this.activeArc.recommendedLength) * 100)}%
    - ${this.totalTurns < this.activeArc.totalMinimumTurns / 2 ? 
        "EARLY IN STORY: Focus on building the world and establishing conflicts" : 
        this.totalTurns < this.activeArc.totalMinimumTurns * 0.8 ? 
        "MID-STORY: Deepen challenges and reveal complexities" : 
        "APPROACHING CLIMAX: Build toward major confrontations and revelations"}
    - ${this.totalTurns < this.activeArc.totalMinimumTurns ? 
        "NOTE: Story should continue for at least another " + (this.activeArc.totalMinimumTurns - this.totalTurns) + " turns" : 
        "Story may begin moving toward conclusion if narratively appropriate"}
    
    PREVIOUS ELEMENTS ESTABLISHED:
    ${Array.from(this.storyBeats).map(beat => `- ${beat}`).join('\n')}
    
    --== END NARRATIVE GUIDANCE ==--
    `;
    
    return guidance;
  }

  // Record important story beats for continuity
  public recordStoryBeat(beat: string): void {
    this.storyBeats.add(beat);
  }

  // Record a new character introduction
  public recordCharacterIntroduction(characterType: string): void {
    this.introducedCharacters.add(characterType);
  }

  // Add item to inventory
  public addToInventory(item: string): void {
    this.inventory.push(item);
  }

  // Get information about story progress
  public getProgressInfo(): ProgressInfo {
    if (!this.activeArc) {
      return {
        currentPhase: "Not started",
        totalTurns: 0,
        progressPercent: 0,
        isNearingEnd: false
      };
    }
    
    return {
      currentPhase: this.getCurrentPhase()?.name || "Unknown",
      totalTurns: this.totalTurns,
      progressPercent: Math.floor((this.totalTurns / this.activeArc.recommendedLength) * 100),
      isNearingEnd: this.totalTurns >= this.activeArc.totalMinimumTurns && 
                     this.currentPhaseIndex >= this.activeArc.phases.length - 2
    };
  }
}

// Hook for using the narrative engine in React components
export function useNarrativeEngine(
  hero: string,
  world: string,
  narrativeStructure: NarrativeStructure,
  worldEncounters: WorldEncounters,
  heroArchetypes: Record<string, HeroArchetype>,
  npcArchetypes: NpcArchetype[],
  mechanics: GameMechanics
) {
  const [engine] = useState(() => 
    new NarrativeEngine(
      narrativeStructure.narrativeArcs,
      worldEncounters.worlds,
      heroArchetypes,
      npcArchetypes,
      mechanics
    )
  );
  
  const [initialized, setInitialized] = useState(false);
  
  // Initialize if not already done
  if (!initialized) {
    engine.initializeAdventure();
    setInitialized(true);
  }
  
  // Function to enhance a system prompt with narrative guidance
  const enhancePrompt = (basePrompt: string): string => {
    const guidance = engine.getNarrativeGuidance(hero, world);
    return `${basePrompt}\n\n${guidance}`;
  };
  
  // Advance the narrative after a user input and AI response
  const advanceNarrative = (userInput: string, aiResponse: string): ProgressInfo => {
    // Extract potential story beats from the AI response
    if (aiResponse.includes("discover")) {
      engine.recordStoryBeat("Discovery of new location or item");
    }
    if (aiResponse.includes("meet") || aiResponse.includes("encounter")) {
      engine.recordStoryBeat("Character encounter");
    }
    if (aiResponse.toLowerCase().includes("fight") || aiResponse.toLowerCase().includes("battle")) {
      engine.recordStoryBeat("Combat encounter");
    }
    
    // Advance to the next turn
    engine.advanceTurn();
    
    return engine.getProgressInfo();
  };
  
  // Enhanced messages generator that includes narrative guidance
  const enhanceMessages = (messages: Message[]): Message[] => {
    // Find the system message
    const systemMessageIndex = messages.findIndex(m => m.role === "system");
    if (systemMessageIndex === -1) return messages;
    
    // Create an enhanced copy of the system message
    const enhancedSystemMessage = {
      ...messages[systemMessageIndex],
      content: enhancePrompt(messages[systemMessageIndex].content)
    };
    
    // Return a new array with the enhanced system message
    return [
      ...messages.slice(0, systemMessageIndex),
      enhancedSystemMessage,
      ...messages.slice(systemMessageIndex + 1)
    ];
  };
  
  return {
    enhancePrompt,
    advanceNarrative,
    enhanceMessages,
    getProgressInfo: () => engine.getProgressInfo()
  };
}

// Helper function to load all narrative data
export async function loadNarrativeData(): Promise<NarrativeData> {
  try {
    // In a real implementation, these would use dynamic imports or fetch
    const narrativeStructure = await import('@/data/narrative/structure.json');
    const worldEncounters = await import('@/data/worlds/encounters.json');
    const characterArchetypes = await import('@/data/characters/archetypes.json');
    const mechanics = await import('@/data/mechanics/game-mechanics.json');
    
    return {
      narrativeStructure: narrativeStructure as unknown as NarrativeStructure,
      worldEncounters: worldEncounters as unknown as WorldEncounters,
      characterArchetypes: characterArchetypes as unknown as CharacterArchetypes,
      mechanics: mechanics as unknown as GameMechanics
    };
  } catch (error) {
    console.error('Error loading narrative data:', error);
    // Return minimal default structure in case of error
    return {
      narrativeStructure: { narrativeArcs: [] },
      worldEncounters: { worlds: {} },
      characterArchetypes: {
        heroArchetypes: {},
        npcArchetypes: []
      },
      mechanics: {
        adventureMechanics: {},
        fightingFantasyElements: {}
      }
    };
  }
}