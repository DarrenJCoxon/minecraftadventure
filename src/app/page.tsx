"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Simple Hero Component
interface HeroOptionProps {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const HeroOption: React.FC<HeroOptionProps> = ({ id, name, description, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`w-full p-4 cursor-pointer transition-all ${
      id === "Steve" ? "bg-[#4f92d1]" : 
      id === "Alex" ? "bg-[#dd7949]" : 
      id === "Zombie" ? "bg-[#5a9950]" : 
      id === "Skeleton" ? "bg-[#aaaaaa]" : 
      "bg-[#ffaa00]"
    } ${isSelected ? 'border-2 border-[#FFAA00]' : 'border-b border-[#222]'}`}
  >
    <h3 className="text-xl font-bold text-white">{name}</h3>
    <p className="text-sm text-white opacity-80">{description}</p>
  </div>
);

// Simple World Component
interface WorldOptionProps {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const WorldOption: React.FC<WorldOptionProps> = ({ id, name, description, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`w-full p-4 cursor-pointer transition-all ${
      id === "Overworld" ? "bg-[#5d8a57]" : 
      id === "Nether" ? "bg-[#c83c3c]" : 
      id === "The End" ? "bg-[#9073b9]" : 
      id === "Jungle" ? "bg-[#1e8449]" : 
      id === "Ice Plains" ? "bg-[#a1caf1]" : 
      "bg-[#e6c34c]"
    } ${isSelected ? 'border-2 border-[#FFAA00]' : 'border-b border-[#222]'}`}
  >
    <h3 className="text-xl font-bold text-white">{name}</h3>
    <p className="text-sm text-white opacity-80">{description}</p>
  </div>
);

export default function HomePage() {
  const [hero, setHero] = useState("Steve");
  const [world, setWorld] = useState("Overworld");
  const [showHeroOptions, setShowHeroOptions] = useState(false);
  const [showWorldOptions, setShowWorldOptions] = useState(false);

  const router = useRouter();

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
    });
    router.push(`/adventure?${params.toString()}`);
  };

  // Find current hero and world
  const currentHero = heroes.find(h => h.id === hero) || heroes[0];
  const currentWorld = worlds.find(w => w.id === world) || worlds[0];

  return (
    <main className="min-h-screen bg-[#222] flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 py-8">
      {/* Container with max width for better responsiveness */}
      <div className="w-full max-w-3xl mx-auto">
        {/* Main content box */}
        <div className="w-full bg-[#333] border-4 border-[#555] p-6 rounded shadow-xl">
          
          {/* Title */}
          <h1 className="adventure-title text-4xl mb-10 text-center">
            MINECRAFT ADVENTURE
          </h1>
          
          <div className="mb-8 space-y-8 px-6"> {/* Added px-6 for padding on both sides */}
            {/* Hero Section */}
            <div>
              <h2 className="text-xl mb-3 font-bold text-[#55FF55]">Choose Your Hero</h2>
              
              {/* Hero Selector */}
              <div className="relative mb-2"> {/* Removed px-4 here */}
                {/* Current selected hero */}
                <HeroOption
                  id={currentHero.id}
                  name={currentHero.name}
                  description={currentHero.description}
                  isSelected={true}
                  onClick={() => setShowHeroOptions(!showHeroOptions)}
                />
                
                {/* Down arrow indicator */}
                <div className="absolute right-4 top-4 text-white text-xl">
                  {showHeroOptions ? '▲' : '▼'}
                </div>
                
                {/* Dropdown options */}
                {showHeroOptions && (
                  <div className="absolute z-10 w-full mt-1 bg-[#222] border border-[#555] shadow-lg">
                    {heroes.map(heroOption => (
                      <HeroOption
                        key={heroOption.id}
                        id={heroOption.id}
                        name={heroOption.name}
                        description={heroOption.description}
                        isSelected={hero === heroOption.id}
                        onClick={() => {
                          setHero(heroOption.id);
                          setShowHeroOptions(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* World Section */}
            <div>
              <h2 className="text-xl mb-3 font-bold text-[#55FF55]">Choose Your World</h2>
              
              {/* World Selector */}
              <div className="relative"> {/* Removed px-4 here */}
                {/* Current selected world */}
                <WorldOption
                  id={currentWorld.id}
                  name={currentWorld.name}
                  description={currentWorld.description}
                  isSelected={true}
                  onClick={() => setShowWorldOptions(!showWorldOptions)}
                />
                
                {/* Down arrow indicator */}
                <div className="absolute right-4 top-4 text-white text-xl">
                  {showWorldOptions ? '▲' : '▼'}
                </div>
                
                {/* Dropdown options */}
                {showWorldOptions && (
                  <div className="absolute z-10 w-full mt-1 bg-[#222] border border-[#555] shadow-lg">
                    {worlds.map(worldOption => (
                      <WorldOption
                        key={worldOption.id}
                        id={worldOption.id}
                        name={worldOption.name}
                        description={worldOption.description}
                        isSelected={world === worldOption.id}
                        onClick={() => {
                          setWorld(worldOption.id);
                          setShowWorldOptions(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Start Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleStart}
              className="btn-3d px-8 py-3 text-xl"
            >
              START ADVENTURE
            </button>
          </div>
          
          {/* Decorative Crafting Table */}
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 bg-[#7E5D38] border-2 border-[#5C4425] relative">
              <div className="absolute top-2 left-2 right-2 bottom-2 bg-[#5C4425] opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}