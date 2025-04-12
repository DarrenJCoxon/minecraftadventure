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

// Compact Dropdown Component
function CompactDropdown({ 
  label, 
  options, 
  selected, 
  onChange,
  colorClass
}: { 
  label: string; 
  options: DropdownOption[]; 
  selected: string;
  onChange: (id: string) => void;
  colorClass: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.id === selected) || options[0];

  return (
    <div className="mb-6 relative">
      <label className="block text-[#4a623e] font-bold mb-2 text-lg">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`cursor-pointer ${colorClass} flex items-center justify-between p-4 rounded-md shadow-sm transition-all hover:shadow-md`}
      >
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{selectedOption.name}</h3>
          <p className="text-white/90 text-sm mt-1">{selectedOption.description}</p>
          {selectedOption.inspirations && (
            <p className="text-white/70 text-xs mt-1 italic">
              Inspired by: {selectedOption.inspirations[0]}
            </p>
          )}
        </div>
        <div className="text-white text-xl ml-3">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md overflow-hidden shadow-lg bg-[#f5f5dc] border border-[#e5dcc3] max-h-64 overflow-y-auto">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`p-3 cursor-pointer border-b border-[#e5dcc3] transition-colors ${
                option.id === selected 
                  ? 'bg-[#f0ece0]' 
                  : 'hover:bg-[#f0ece0]'
              }`}
            >
              <h4 className="font-bold text-[#333]">{option.name}</h4>
              <p className="text-[#5a5a5a] text-sm">{option.description}</p>
              {option.inspirations && (
                <p className="text-[#5a5a5a] text-xs italic">
                  Inspired by: {option.inspirations[0]}
                </p>
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
    <main className="min-h-screen bg-[#f5f5dc] text-[#333]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#4a623e] mb-4 tracking-wide">
            MINECRAFT ADVENTURE
          </h1>
          <p className="text-[#5a5a5a] max-w-2xl mx-auto">
            Choose your hero, world, and adventure style to begin your journey through a narrative adventure inspired by classic Fighting Fantasy gamebooks.
          </p>
        </div>
        
        {/* Main content */}
        <div className="bg-[#fffcf0] rounded-lg shadow-md p-6 mb-8">
          {/* Hero selection */}
          <CompactDropdown
            label="Choose Your Hero"
            options={heroes}
            selected={hero}
            onChange={setHero}
            colorClass="bg-gradient-to-r from-[#4f92d1] to-[#3a7ab9]"
          />
          
          {/* World selection */}
          <CompactDropdown
            label="Choose Your World"
            options={worlds}
            selected={world}
            onChange={setWorld}
            colorClass="bg-gradient-to-r from-[#5d8a57] to-[#4a7046]"
          />
          
          {/* Storyline selection */}
          {loading ? (
            <div className="mb-6">
              <label className="block text-[#4a623e] font-bold mb-2 text-lg">
                Choose Your Adventure Style
              </label>
              <div className="animate-pulse bg-gray-300 h-24 rounded-md"></div>
            </div>
          ) : (
            <CompactDropdown
              label="Choose Your Adventure Style"
              options={storylines}
              selected={storyline}
              onChange={setStoryline}
              colorClass="bg-gradient-to-r from-[#6b7280] to-[#4b5563]"
            />
          )}
          
          <div className="text-[#757575] text-sm italic mb-8 mt-2">
            Each adventure style provides a different narrative structure and special encounters inspired by classic gamebooks.
          </div>
          
          {/* Start button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleStart}
              className="bg-[#7b9e67] hover:bg-[#4a623e] text-white font-bold py-4 px-10 rounded-md shadow-md transition-all text-xl tracking-wide hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md"
            >
              START ADVENTURE
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center gap-8 opacity-80">
          <div className="w-12 h-12 bg-[#7b5427] rounded-sm relative shadow-sm">
            <div className="absolute inset-2 bg-[#8b6437] opacity-60"></div>
          </div>
          <div className="w-12 h-12 bg-[#5d8a57] rounded-sm relative shadow-sm">
            <div className="absolute inset-2 bg-[#7ba875] opacity-60"></div>
          </div>
          <div className="w-12 h-12 bg-[#7b7b7b] rounded-sm relative shadow-sm">
            <div className="absolute inset-2 bg-[#9b9b9b] opacity-60"></div>
          </div>
        </div>
      </div>
    </main>
  );
}