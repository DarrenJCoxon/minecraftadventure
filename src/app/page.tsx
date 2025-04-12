"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Dropdown Option Interface
interface DropdownOption {
  id: string;
  name: string;
  description: string;
  inspirations?: string[];
}

// Minecraft Dropdown Component
function MinecraftDropdown({ 
  label, 
  options, 
  selected, 
  onChange,
  type = "default"
}: { 
  label: string; 
  options: DropdownOption[]; 
  selected: string;
  onChange: (id: string) => void;
  type?: "hero" | "world" | "adventure" | "default";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.id === selected) || options[0];

  // Get background color based on type
  const getBackgroundColor = () => {
    switch(type) {
      case "hero": return "bg-[#55AAFF]";
      case "world": return "bg-[#7BC253]";
      case "adventure": return "bg-[#888888]";
      default: return "bg-[#7d7d7d]";
    }
  };

  // Get block icon based on selected option
  const getBlockIcon = () => {
    if (type === "hero") {
      switch(selected) {
        case "Steve": return <div className="minecraft-block" style={{backgroundColor: "#F9C49A", border: "2px solid #555"}}></div>;
        case "Alex": return <div className="minecraft-block" style={{backgroundColor: "#F9AA7C", border: "2px solid #555"}}></div>;
        case "Zombie": return <div className="minecraft-block" style={{backgroundColor: "#529456", border: "2px solid #555"}}></div>;
        case "Skeleton": return <div className="minecraft-block" style={{backgroundColor: "#C6C6C6", border: "2px solid #555"}}></div>;
        default: return <div className="minecraft-block" style={{backgroundColor: "#FFA500", border: "2px solid #555"}}></div>;
      }
    } else if (type === "world") {
      switch(selected) {
        case "Overworld": return <div className="minecraft-block-grass"></div>;
        case "Nether": return <div className="minecraft-block" style={{backgroundColor: "#B02E26", border: "2px solid #555"}}></div>;
        case "The End": return <div className="minecraft-block" style={{backgroundColor: "#2A193E", border: "2px solid #555"}}></div>;
        case "Jungle": return <div className="minecraft-block" style={{backgroundColor: "#2D7F32", border: "2px solid #555"}}></div>;
        case "Ice Plains": return <div className="minecraft-block" style={{backgroundColor: "#80B9FC", border: "2px solid #555"}}></div>;
        case "Desert Temple": return <div className="minecraft-block" style={{backgroundColor: "#E6CE82", border: "2px solid #555"}}></div>;
        default: return <div className="minecraft-block-grass"></div>;
      }
    } else if (type === "adventure") {
      return <div className="minecraft-block" style={{backgroundColor: "#AAAAAA", border: "2px solid #555"}}></div>;
    }
    
    return <div className="minecraft-block-stone"></div>;
  };

  return (
    <div className="relative mb-6">
      <div className="minecraft-dropdown">
        <div className="minecraft-dropdown-header">
          {label}
        </div>
        
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`minecraft-dropdown-selected ${getBackgroundColor()}`}
        >
          <div className="flex items-center">
            {getBlockIcon()}
            <div>
              <div className="font-bold">{selectedOption.name}</div>
              <div className="text-sm">{selectedOption.description}</div>
              {selectedOption.inspirations && (
                <div className="text-xs opacity-80">
                  Inspired by: {selectedOption.inspirations[0]}
                </div>
              )}
            </div>
          </div>
          <span>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="minecraft-dropdown-options">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`minecraft-dropdown-option ${option.id === selected ? 'selected' : ''}`}
            >
              <div className="font-bold">{option.name}</div>
              <div className="text-sm">{option.description}</div>
              {option.inspirations && (
                <div className="text-xs">
                  Inspired by: {option.inspirations[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [hero, setHero] = useState("Steve");
  const [world, setWorld] = useState("Overworld");
  const [storyline, setStoryline] = useState("classic_adventure");
  const [storylines, setStorylines] = useState<DropdownOption[]>([
    {
      id: "classic_adventure",
      name: "Classic Adventure",
      description: "A standard adventuring quest with exploration, combat, and puzzles"
    }
  ]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Load storylines
  useEffect(() => {
    async function loadStorylines() {
      try {
        const response = await fetch('/api/storylines');
        if (response.ok) {
          const data = await response.json();
          setStorylines(data.storylines);
        } else {
          console.error('Failed to load storylines');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading storylines:', error);
        setLoading(false);
      }
    }
    
    loadStorylines();
  }, []);

  // Hero data
  const heroes = [
    {
      id: "Steve",
      name: "Steve",
      description: "The classic miner with balanced skills"
    },
    {
      id: "Alex",
      name: "Alex",
      description: "Swift and resourceful explorer"
    },
    {
      id: "Zombie",
      name: "Zombie",
      description: "Tough but slow undead miner"
    },
    {
      id: "Skeleton",
      name: "Skeleton",
      description: "Accurate but fragile archer"
    },
    {
      id: "Custom",
      name: "Custom",
      description: "Create your own adventure"
    }
  ];

  // World data
  const worlds = [
    {
      id: "Overworld",
      name: "Overworld",
      description: "The familiar grassy plains and forests"
    },
    {
      id: "Nether",
      name: "Nether",
      description: "A dangerous world of fire and lava"
    },
    {
      id: "The End",
      name: "The End",
      description: "Mysterious floating islands in darkness"
    },
    {
      id: "Jungle",
      name: "Jungle",
      description: "Dense foliage hiding ancient temples"
    },
    {
      id: "Ice Plains",
      name: "Ice Plains",
      description: "Frozen landscapes with hidden treasures"
    },
    {
      id: "Desert Temple",
      name: "Desert Temple",
      description: "Sandy dunes hiding ancient treasures"
    }
  ];

  const handleStart = () => {
    const params = new URLSearchParams({
      hero,
      world,
      storyline,
    });
    router.push(`/adventure?${params.toString()}`);
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Title section */}
        <div className="mb-10 text-center">
          <h1 className="minecraft-title text-5xl mb-6">
            MINECRAFT<br/>ADVENTURE
          </h1>
          
          <div className="minecraft-panel my-4 mx-auto max-w-lg">
            <p className="text-center text-lg">
              Choose your hero, world, and adventure style to begin your journey through a narrative adventure inspired by classic Fighting Fantasy gamebooks.
            </p>
          </div>
        </div>
        
        {/* Selection container */}
        <div className="bg-black bg-opacity-60 border-[3px] border-[#636363] p-6 rounded-sm shadow-lg">
          {/* Hero selection */}
          <MinecraftDropdown
            label="CHOOSE YOUR HERO"
            options={heroes}
            selected={hero}
            onChange={setHero}
            type="hero"
          />
          
          {/* World selection */}
          <MinecraftDropdown
            label="CHOOSE YOUR WORLD"
            options={worlds}
            selected={world}
            onChange={setWorld}
            type="world"
          />
          
          {/* Storyline selection */}
          {loading ? (
            <div className="minecraft-dropdown mb-6">
              <div className="minecraft-dropdown-header">
                CHOOSE YOUR ADVENTURE STYLE
              </div>
              <div className="h-24 bg-[#555] animate-pulse"></div>
            </div>
          ) : (
            <MinecraftDropdown
              label="CHOOSE YOUR ADVENTURE STYLE"
              options={storylines}
              selected={storyline}
              onChange={setStoryline}
              type="adventure"
            />
          )}
          
          <div className="minecraft-panel mb-6">
            <p>
              Each adventure style provides a different narrative structure and special encounters inspired by classic gamebooks.
            </p>
          </div>
          
          {/* Start button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleStart}
              className="minecraft-button text-xl px-8 py-4"
            >
              START ADVENTURE
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center gap-8 my-8">
          <div className="minecraft-block-dirt w-10 h-10 transform hover:scale-110 transition-transform"></div>
          <div className="minecraft-block-grass w-10 h-10 transform hover:scale-110 transition-transform"></div>
          <div className="minecraft-block-stone w-10 h-10 transform hover:scale-110 transition-transform"></div>
        </div>
        
        <div className="text-center text-white text-shadow text-sm mb-6">
          Craft your story • Mine your adventure
        </div>
      </div>
    </main>
  );
}