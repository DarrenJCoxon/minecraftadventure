export interface UserChoice {
    id: string;
    label: string;       // e.g., "Explore the cave"
    value: string;       // e.g., "explore_cave"
  }
  
  export interface StoryBlock {
    id: string;
    text: string;        // Narration or generated story segment
    imageUrl?: string;   // Optional image URL
    choices?: UserChoice[];  // Next possible choices
    timestamp: number;   // Unix time for ordering
    actor?: "player" | "system";  // Who created this block
  }
  
  export interface AdventureSession {
    sessionId: string;
    hero: string;
    world: string;
    history: StoryBlock[];     // Ordered story messages
  }
  
  export interface APICallRequest {
    model?: string;   // Defaults to Quasar Alpha
    messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>;
    hero?: string;
    world?: string;
  }
  
  export interface APIResponse {
    message: string;           // New story text response
    imageUrl?: string;         // Optional image describing the scene
    choices?: UserChoice[];    // Next choices
    error?: string;            // Optional error message
  }