'use client';

import React, { useState } from "react";

const worlds = ["Overworld", "Nether", "The End", "Jungle", "Ice Plains", "Desert Temple"];

// Map world to color/icon
const worldColors: Record<string, string> = {
  "Overworld": "bg-[#5D8A57]",   // Green for grass
  "Nether": "bg-[#8C3A30]",      // Red for Nether
  "The End": "bg-[#2A193E]",     // Purple for End
  "Jungle": "bg-[#2D7F32]",      // Darker green for jungle
  "Ice Plains": "bg-[#80B9FC]",  // Light blue for ice
  "Desert Temple": "bg-[#E6CE82]" // Tan for sand
};

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function WorldSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelect = (world: string) => {
    onChange(world);
    setIsOpen(false);
  };

  return (
    <div className="mb-6 relative">
      <label className="block mb-2 font-mono text-white text-sm uppercase tracking-wide">Choose your world:</label>
      
      {/* Custom Minecraft-style dropdown */}
      <div className="relative">
        {/* Dropdown button */}
        <button 
          onClick={toggleDropdown}
          className="w-full py-2 px-3 flex justify-between items-center bg-[#373737] 
                    border-2 border-b-4 border-t-2 border-l-2 border-r-2 
                    border-b-[#1D1D1D] border-t-[#4A4A4A] border-l-[#4A4A4A] border-r-[#1D1D1D]
                    text-left text-white"
        >
          <span className="flex items-center">
            {/* World icon */}
            <span className={`inline-block w-4 h-4 mr-2 ${worldColors[value] || "bg-gray-500"}`}></span>
            {value}
          </span>
          <span className="ml-2">▼</span>
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-[#373737] border-2 border-[#1D1D1D] shadow-lg">
            {worlds.map((world) => (
              <div 
                key={world}
                onClick={() => handleSelect(world)}
                className={`px-3 py-2 cursor-pointer flex items-center hover:bg-[#4A4A4A] ${
                  world === value ? 'bg-[#4A4A4A]' : ''
                }`}
              >
                <span className={`inline-block w-4 h-4 mr-2 ${worldColors[world] || "bg-gray-500"}`}></span>
                {world}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* World preview - simple block pattern based on selected world */}
      <div className="mt-3 h-12 w-full overflow-hidden relative">
        {value === "Overworld" && (
          <div className="w-full h-full bg-[#5D8A57] relative">
            <div className="absolute top-6 left-0 right-0 h-6 bg-[#8B6D3F]"></div>
            <div className="absolute left-4 top-2 w-4 h-4 bg-[#895C31]"></div>
            <div className="absolute right-6 top-1 w-3 h-5 bg-[#578A57]"></div>
          </div>
        )}
        
        {value === "Nether" && (
          <div className="w-full h-full bg-[#8C3A30] relative">
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#502924]"></div>
            <div className="absolute left-3 top-1 w-5 h-5 bg-[#E24B19]"></div>
            <div className="absolute right-5 top-2 w-6 h-6 bg-[#A23E36]"></div>
          </div>
        )}
        
        {value === "The End" && (
          <div className="w-full h-full bg-[#2A193E] relative">
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#0D0811]"></div>
            <div className="absolute left-7 top-2 w-7 h-7 bg-[#E4D5FC]"></div>
            <div className="absolute right-3 top-4 w-4 h-4 bg-[#3F2259]"></div>
          </div>
        )}
        
        {value === "Jungle" && (
          <div className="w-full h-full bg-[#2D7F32] relative">
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#8B6D3F]"></div>
            <div className="absolute left-2 top-0 w-3 h-6 bg-[#156B18]"></div>
            <div className="absolute left-6 top-0 w-3 h-9 bg-[#156B18]"></div>
            <div className="absolute right-4 top-0 w-3 h-7 bg-[#156B18]"></div>
          </div>
        )}
        
        {value === "Ice Plains" && (
          <div className="w-full h-full bg-[#80B9FC] relative">
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#FFFFFF]"></div>
            <div className="absolute left-5 top-2 w-7 h-3 bg-[#A3CBF9]"></div>
            <div className="absolute right-2 top-1 w-4 h-4 bg-[#C8E1FF]"></div>
          </div>
        )}
        
        {value === "Desert Temple" && (
          <div className="w-full h-full bg-[#E6CE82] relative">
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#DCA55A]"></div>
            <div className="absolute left-3 top-1 w-4 h-4 bg-[#E8D394]"></div>
            <div className="absolute right-5 top-2 w-6 h-3 bg-[#CBB368]"></div>
          </div>
        )}
      </div>
    </div>
  );
}