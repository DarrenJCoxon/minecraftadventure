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
      case "hero": return "bg-[#3080D0]"; // Darker blue
      case "world": return "bg-[#5AA33A]"; // Darker green
      case "adventure": return "bg-[#666666]"; // Darker grey
      default: return "bg-[#666666]";
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
      {/* Label */}
      <div className="minecraft-dropdown">
        <div className="minecraft-dropdown-header mb-2 inline-block px-3 py-1 bg-black text-white font-bold border-b-2 border-[#555]">
          {label}
        </div>
        
        {/* Selected option */}
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`minecraft-dropdown-selected group cursor-pointer ${getBackgroundColor()} border-4 border-b-[6px] border-t-[#cccccc] border-l-[#cccccc] border-r-[#555555] border-b-[#555555] transition-all duration-100 hover:brightness-110 active:brightness-90 active:translate-y-[2px] active:border-b-[4px]`}
        >
          <div className="flex items-center">
            {getBlockIcon()}
            <div className="flex-1">
              <div className="font-bold text-lg text-white">{selectedOption.name}</div>
              <div className="text-sm text-[#EEEEEE]">{selectedOption.description}</div>
              {selectedOption.inspirations && (
                <div className="text-xs text-[#DDDDDD] italic">
                  Inspired by: {selectedOption.inspirations[0]}
                </div>
              )}
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-[#00000055] rounded-sm ml-2">
              <span className="text-lg text-white">{isOpen ? '▲' : '▼'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dropdown options */}
      {isOpen && (
        <div className="minecraft-dropdown-options absolute left-0 right-0 z-40 mt-1 max-h-[300px] overflow-y-auto border-2 border-[#555555] shadow-lg">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`group minecraft-dropdown-option cursor-pointer p-3 transition-all duration-150
                ${option.id === selected 
                  ? 'bg-[#555555] text-white selected border-l-4 border-l-[#44bd32]' 
                  : 'bg-[#373737] hover:bg-[#444444] border-l-4 border-l-transparent hover:border-l-[#aaaaaa]'}`}
            >
              <div className="flex items-center">
                {/* Show an icon based on the option type */}
                {type === "hero" && (
                  <div className="minecraft-block mr-2" style={{
                    backgroundColor: 
                      option.id === "Steve" ? "#F9C49A" : 
                      option.id === "Alex" ? "#F9AA7C" : 
                      option.id === "Zombie" ? "#529456" : 
                      option.id === "Skeleton" ? "#C6C6C6" : "#FFA500",
                    border: "2px solid #555"
                  }}></div>
                )}
                
                {type === "world" && (
                  option.id === "Overworld" ? <div className="minecraft-block-grass mr-2"></div> :
                  <div className="minecraft-block mr-2" style={{
                    backgroundColor: 
                      option.id === "Nether" ? "#B02E26" : 
                      option.id === "The End" ? "#2A193E" : 
                      option.id === "Jungle" ? "#2D7F32" : 
                      option.id === "Ice Plains" ? "#80B9FC" : 
                      option.id === "Desert Temple" ? "#E6CE82" : "#7BC253",
                    border: "2px solid #555"
                  }}></div>
                )}
                
                {type === "adventure" && (
                  <div className="minecraft-block mr-2" style={{backgroundColor: "#AAAAAA", border: "2px solid #555"}}></div>
                )}
                
                <div className="flex-1">
                  <div className={`font-bold text-white ${option.id === selected ? 'text-[#AAFFAA]' : 'group-hover:text-[#FFFFFF]'}`}>
                    {option.name}
                  </div>
                  <div className={`text-sm ${option.id === selected ? 'text-[#FFFFFF]' : 'text-[#DDDDDD] group-hover:text-[#FFFFFF]'}`}>
                    {option.description}
                  </div>
                  {option.inspirations && (
                    <div className={`text-xs ${option.id === selected ? 'text-[#CCFFCC]' : 'text-[#BBBBBB] group-hover:text-[#DDDDDD]'} italic`}>
                      Inspired by: {option.inspirations[0]}
                    </div>
                  )}
                </div>
                
                {option.id === selected && (
                  <div className="w-6 h-6 flex items-center justify-center bg-[#44bd32] rounded-sm ml-2">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
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
          
          <div className="minecraft-panel my-4 mx-auto max-w-lg p-4 bg-black bg-opacity-75 border-2 border-[#636363]">
            <p className="text-center text-lg text-white homepage-intro-text">
              Choose your hero, world, and adventure style to begin your journey through a narrative adventure inspired by classic Fighting Fantasy gamebooks.
            </p>
          </div>
        </div>
        
        {/* Selection container - make background darker */}
        <div className="bg-black bg-opacity-75 border-[3px] border-[#636363] p-6 rounded-sm shadow-lg">
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
          
          {/* Storyline selection - improve loading state contrast */}
          {loading ? (
            <div className="minecraft-dropdown mb-6">
              <div className="minecraft-dropdown-header mb-2 inline-block px-3 py-1 bg-black text-white font-bold border-b-2 border-[#555]">
                CHOOSE YOUR ADVENTURE STYLE
              </div>
              <div className="h-24 bg-[#666] border-4 border-t-[#cccccc] border-l-[#cccccc] border-r-[#555555] border-b-[#555555] animate-pulse">
                <div className="flex items-center h-full px-4">
                  <div className="text-white">Loading adventures...</div>
                </div>
              </div>
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
          
          <div className="minecraft-panel mb-6 p-4 bg-[#000000] bg-opacity-80 border-2 border-[#444444] mt-4">
            <p className="text-[#FFFFFF] text-sm">
              Each adventure style provides a different narrative structure and special encounters inspired by classic gamebooks.
            </p>
          </div>
          
          {/* Start button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleStart}
              className="minecraft-button text-xl px-10 py-4 transform hover:scale-105 active:scale-100 transition-transform"
            >
              START ADVENTURE
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center gap-8 my-8">
          <div className="minecraft-block-dirt w-10 h-10 transform hover:scale-110 hover:rotate-3 transition-transform cursor-pointer"></div>
          <div className="minecraft-block-grass w-10 h-10 transform hover:scale-110 hover:rotate-3 transition-transform cursor-pointer"></div>
          <div className="minecraft-block-stone w-10 h-10 transform hover:scale-110 hover:rotate-3 transition-transform cursor-pointer"></div>
        </div>
        
        <div className="text-center text-white text-shadow text-sm mb-6">
          Craft your story • Mine your adventure
        </div>
      </div>
    </main>
  );
}