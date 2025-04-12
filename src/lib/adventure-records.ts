import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  effect?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface QuestRecord {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

interface Character {
  id: string;
  name: string;
  type: string;
  relationship: 'ally' | 'neutral' | 'hostile';
  notes: string;
}

interface LocationRecord {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
}

export interface AdventureRecord {
  // Core stats
  health: number;
  maxHealth: number;
  
  // Inventory management
  inventory: Item[];
  maxInventory: number;
  
  // Skills and abilities
  skills: Skill[];
  
  // Quest tracking
  quests: QuestRecord[];
  
  // Character relationships
  characters: Character[];
  
  // Discovered locations
  locations: LocationRecord[];
  
  // Notable events
  eventLog: string[];
}

// Define types for the record update payloads
type HealthUpdatePayload = number;

interface InventoryUpdatePayload {
  action: 'add' | 'remove';
  item?: Item;
  itemId?: string;
}

interface SkillUpdatePayload {
  skillId: string;
  newLevel: number;
}

interface QuestUpdatePayload {
  action: 'add' | 'complete';
  questId?: string;
  quest?: QuestRecord;
}

interface CharacterUpdatePayload {
  action: 'updateRelationship' | 'addNote';
  characterId: string;
  relationship?: 'ally' | 'neutral' | 'hostile';
  note?: string;
}

// Union type for all possible update payloads
type RecordUpdatePayload = 
  | HealthUpdatePayload 
  | InventoryUpdatePayload 
  | SkillUpdatePayload 
  | QuestUpdatePayload 
  | CharacterUpdatePayload 
  | string; // For eventLog

const DEFAULT_RECORD: AdventureRecord = {
  health: 20,
  maxHealth: 20,
  inventory: [],
  maxInventory: 10,
  skills: [
    { id: 'mining', name: 'Mining', level: 1 },
    { id: 'combat', name: 'Combat', level: 1 },
    { id: 'exploration', name: 'Exploration', level: 1 },
    { id: 'crafting', name: 'Crafting', level: 1 }
  ],
  quests: [],
  characters: [],
  locations: [],
  eventLog: []
};

// NLP helpers to extract game elements from text
export const extractors = {
  // Extract items from text
  extractItems(text: string): Partial<Item>[] {
    const items: Partial<Item>[] = [];
    
    // Common item prefixes and patterns in adventure text
    const itemPatterns = [
      /you (find|discover|pick up|receive|are given) (a|an|the) ([a-z0-9 -]+)/gi,
      /you add (a|an|the) ([a-z0-9 -]+) to your inventory/gi,
      /puts (a|an|the) ([a-z0-9 -]+) into your hands/gi,
      /offers you (a|an|the) ([a-z0-9 -]+)/gi
    ];
    
    for (const pattern of itemPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const itemName = match[pattern.source.includes('puts') || pattern.source.includes('offers') ? 2 : 3].trim();
        // Filter out common non-items
        if (!['moment', 'chance', 'way', 'look', 'glance', 'few steps', 'few minutes', 'choice', 'moment to', 'first time', 'bit', 'few', 'way forward', 'way around'].includes(itemName)) {
          const id = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
          items.push({
            id,
            name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
            description: `Found during your adventure.`
          });
        }
      }
    }
    
    return items;
  },
  
  // Extract characters from text
  extractCharacters(text: string): Partial<Character>[] {
    const characters: Partial<Character>[] = [];
    
    // Character introduction patterns
    const characterPatterns = [
      /(?:a|an|the) ([a-z0-9 -]+) (?:named|called) "?([A-Z][a-z]+)"?/gi,
      /"?([A-Z][a-z]+)"? the ([a-z0-9 -]+) (?:approaches|greets|says|appears|stands)/gi,
      /"([A-Z][a-z]+)" (?:says|mutters|shouts|whispers|exclaims)/gi
    ];
    
    for (const pattern of characterPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        let name, type;
        if (pattern.source.includes('named|called')) {
          type = match[1].trim();
          name = match[2].trim();
        } else if (pattern.source.includes('the ([a-z0-9 -]+)')) {
          name = match[1].trim();
          type = match[2].trim();
        } else {
          name = match[1].trim();
          type = 'Unknown';
        }
        
        // Filter out common words that might get falsely detected as names
        if (name.length > 2 && !['The', 'You', 'She', 'His', 'Her', 'They'].includes(name)) {
          const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          // Determine relationship heuristically
          let relationship: 'ally' | 'neutral' | 'hostile' = 'neutral';
          const lowerText = text.toLowerCase();
          if (lowerText.includes(`${name.toLowerCase()} attack`) || 
              lowerText.includes(`${name.toLowerCase()} threaten`) || 
              lowerText.includes(`hostile ${name.toLowerCase()}`)) {
            relationship = 'hostile';
          } else if (lowerText.includes(`${name.toLowerCase()} help`) || 
                     lowerText.includes(`${name.toLowerCase()} assist`) || 
                     lowerText.includes(`friendly ${name.toLowerCase()}`)) {
            relationship = 'ally';
          }
          
          characters.push({
            id,
            name,
            type: type.charAt(0).toUpperCase() + type.slice(1),
            relationship,
            notes: 'Met during your adventure.'
          });
        }
      }
    }
    
    return characters;
  },
  
  // Extract locations from text
  extractLocations(text: string): Partial<LocationRecord>[] {
    const locations: Partial<LocationRecord>[] = [];
    
    // Location patterns
    const locationPatterns = [
      /you (?:arrive at|reach|enter|discover) (?:a|an|the) ([a-z0-9 -]+) (?:called|known as) "?([A-Z][a-z]+(?: [A-Z][a-z]+)*)"?/gi,
      /you (?:arrive at|reach|enter|discover) "?([A-Z][a-z]+(?: [A-Z][a-z]+)*)"?/gi,
      /you find yourself (?:in|at) (?:a|an|the) ([a-z0-9 -]+)/gi
    ];
    
    for (const pattern of locationPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        let name, description;
        
        if (pattern.source.includes('called|known as')) {
          description = match[1].trim();
          name = match[2].trim();
        } else if (pattern.source.includes('find yourself')) {
          name = match[1].trim();
          description = `A ${name} discovered during your adventure.`;
        } else {
          name = match[1].trim();
          description = `Discovered during your adventure.`;
        }
        
        // Filter out common non-locations
        if (!['moment', 'stop', 'halt', 'clearing', 'conclusion', 'realization'].includes(name.toLowerCase())) {
          const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          locations.push({
            id,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description,
            discovered: true
          });
        }
      }
    }
    
    return locations;
  },
  
  // Extract quests from text
  extractQuests(text: string): Partial<QuestRecord>[] {
    const quests: Partial<QuestRecord>[] = [];
    
    // Quest patterns
    const questPatterns = [
      /(?:asked|requested|tasked|charged|needs) you to ([a-z0-9 -]+)/gi,
      /your (?:quest|mission|task) is to ([a-z0-9 -]+)/gi,
      /you must ([a-z0-9 -]+) (?:in order to|to|before)/gi,
      /you agree to ([a-z0-9 -]+)/gi
    ];
    
    for (const pattern of questPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const questDescription = match[1].trim();
        // Filter out common non-quests
        if (questDescription.length > 10 && !questDescription.includes('survive') && !questDescription.includes('decide')) {
          const id = `quest_${quests.length + 1}`;
          const name = `Quest ${quests.length + 1}`;
          quests.push({
            id,
            name,
            description: questDescription.charAt(0).toUpperCase() + questDescription.slice(1),
            completed: false
          });
        }
      }
    }
    
    return quests;
  }
};

// Return type for updateFromText function
interface UpdateResult {
  newItems: number;
  newCharacters: number;
  newLocations: number;
  newQuests: number;
}

// Hook for managing adventure records
export function useAdventureRecords(hero: string) {
  // Use local storage key based on hero name for persistence
  const storageKey = `minecraft-adventure-${hero.toLowerCase()}`;
  
  // Initialize state from local storage or defaults
  const [record, setRecord] = useState<AdventureRecord>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved) as AdventureRecord;
        } catch (e) {
          console.error("Failed to parse saved adventure record:", e);
        }
      }
    }
    return DEFAULT_RECORD;
  });
  
  // Save to local storage when record changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(record));
    }
  }, [record, storageKey]);
  
  // Reset adventure record
  const resetRecord = (): void => {
    setRecord(DEFAULT_RECORD);
  };
  
  // Update record based on AI response text
  const updateFromText = (text: string): UpdateResult => {
    // Extract new elements
    const newItems = extractors.extractItems(text);
    const newCharacters = extractors.extractCharacters(text);
    const newLocations = extractors.extractLocations(text);
    const newQuests = extractors.extractQuests(text);
    
    // Update record with new elements, avoiding duplicates
    setRecord(prev => {
      const updatedRecord = { ...prev };
      
      // Add new items
      if (newItems.length > 0) {
        const existingIds = new Set(prev.inventory.map(item => item.id));
        newItems.forEach(item => {
          if (item.id && !existingIds.has(item.id)) {
            updatedRecord.inventory.push(item as Item);
            updatedRecord.eventLog.push(`Added ${item.name} to inventory`);
          }
        });
      }
      
      // Add new characters
      if (newCharacters.length > 0) {
        const existingIds = new Set(prev.characters.map(char => char.id));
        newCharacters.forEach(char => {
          if (char.id && !existingIds.has(char.id)) {
            updatedRecord.characters.push(char as Character);
            updatedRecord.eventLog.push(`Met ${char.name}, a ${char.type}`);
          }
        });
      }
      
      // Add new locations
      if (newLocations.length > 0) {
        const existingIds = new Set(prev.locations.map(loc => loc.id));
        newLocations.forEach(loc => {
          if (loc.id && !existingIds.has(loc.id)) {
            updatedRecord.locations.push(loc as LocationRecord);
            updatedRecord.eventLog.push(`Discovered ${loc.name}`);
          }
        });
      }
      
      // Add new quests
      if (newQuests.length > 0) {
        const existingDescriptions = new Set(prev.quests.map(q => q.description.toLowerCase()));
        newQuests.forEach(quest => {
          if (quest.description && !existingDescriptions.has(quest.description.toLowerCase())) {
            updatedRecord.quests.push(quest as QuestRecord);
            updatedRecord.eventLog.push(`New quest: ${quest.description}`);
          }
        });
      }
      
      return updatedRecord;
    });
    
    return {
      newItems: newItems.length,
      newCharacters: newCharacters.length,
      newLocations: newLocations.length,
      newQuests: newQuests.length
    };
  };
  
  // Manually update record elements with proper type handling
  const updateRecordElement = (type: keyof AdventureRecord, payload: RecordUpdatePayload): void => {
    setRecord(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'health':
          if (typeof payload === 'number') {
            const newHealth = Math.max(0, Math.min(payload, prev.maxHealth));
            updated.health = newHealth;
            if (payload < prev.health) {
              updated.eventLog.push(`Took damage. Health now ${updated.health}/${updated.maxHealth}`);
            } else if (payload > prev.health) {
              updated.eventLog.push(`Recovered health. Now ${updated.health}/${updated.maxHealth}`);
            }
          }
          break;
          
        case 'inventory':
          if (typeof payload === 'object' && 'action' in payload) {
            const invPayload = payload as InventoryUpdatePayload;
            if (invPayload.action === 'add' && invPayload.item) {
              if (updated.inventory.length < updated.maxInventory) {
                updated.inventory.push(invPayload.item);
                updated.eventLog.push(`Added ${invPayload.item.name} to inventory`);
              }
            } else if (invPayload.action === 'remove' && invPayload.itemId) {
              const itemIndex = updated.inventory.findIndex(i => i.id === invPayload.itemId);
              if (itemIndex >= 0) {
                const removedItem = updated.inventory[itemIndex];
                updated.inventory.splice(itemIndex, 1);
                updated.eventLog.push(`Removed ${removedItem.name} from inventory`);
              }
            }
          }
          break;
          
        case 'skills':
          if (typeof payload === 'object' && 'skillId' in payload && 'newLevel' in payload) {
            const skillPayload = payload as SkillUpdatePayload;
            const skillIndex = updated.skills.findIndex(s => s.id === skillPayload.skillId);
            if (skillIndex >= 0) {
              const oldLevel = updated.skills[skillIndex].level;
              updated.skills[skillIndex].level = skillPayload.newLevel;
              updated.eventLog.push(`${updated.skills[skillIndex].name} skill increased from ${oldLevel} to ${skillPayload.newLevel}`);
            }
          }
          break;
          
        case 'quests':
          if (typeof payload === 'object' && 'action' in payload) {
            const questPayload = payload as QuestUpdatePayload;
            if (questPayload.action === 'complete' && questPayload.questId) {
              const questIndex = updated.quests.findIndex(q => q.id === questPayload.questId);
              if (questIndex >= 0 && !updated.quests[questIndex].completed) {
                updated.quests[questIndex].completed = true;
                updated.eventLog.push(`Completed quest: ${updated.quests[questIndex].description}`);
              }
            } else if (questPayload.action === 'add' && questPayload.quest) {
              updated.quests.push(questPayload.quest);
              updated.eventLog.push(`New quest: ${questPayload.quest.description}`);
            }
          }
          break;
          
        case 'characters':
          if (typeof payload === 'object' && 'action' in payload && 'characterId' in payload) {
            const charPayload = payload as CharacterUpdatePayload;
            const charIndex = updated.characters.findIndex(c => c.id === charPayload.characterId);
            
            if (charIndex >= 0) {
              if (charPayload.action === 'updateRelationship' && charPayload.relationship) {
                const oldRel = updated.characters[charIndex].relationship;
                updated.characters[charIndex].relationship = charPayload.relationship;
                updated.eventLog.push(`${updated.characters[charIndex].name}'s relationship changed from ${oldRel} to ${charPayload.relationship}`);
              } else if (charPayload.action === 'addNote' && charPayload.note) {
                updated.characters[charIndex].notes += `\n${charPayload.note}`;
              }
            }
          }
          break;
          
        case 'eventLog':
          if (typeof payload === 'string') {
            updated.eventLog.push(payload);
          }
          break;
          
        default:
          console.warn(`Unknown record element type: ${type}`);
      }
      
      return updated;
    });
  };
  
  return {
    record,
    resetRecord,
    updateFromText,
    updateRecordElement
  };
}