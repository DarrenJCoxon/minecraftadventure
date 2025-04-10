'use client';

import React, { useState } from "react";

const heroes = ["Steve", "Alex", "Zombie", "Skeleton", "Custom"];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function HeroSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelect = (hero: string) => {
    onChange(hero);
    setIsOpen(false);
  };

  return (
    <div className="mb-6 relative">
      <label className="block mb-2 font-mono text-white text-sm uppercase tracking-wide">Choose your hero:</label>
      
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
            {/* Hero icon - simple colored square */}
            <span className={`inline-block w-4 h-4 mr-2 ${
              value === "Steve" ? "bg-[#8C6755]" : 
              value === "Alex" ? "bg-[#F47A42]" : 
              value === "Zombie" ? "bg-[#5A9950]" : 
              value === "Skeleton" ? "bg-[#D9D9D9]" : 
              "bg-[#FFA500]"
            }`}></span>
            {value}
          </span>
          <span className="ml-2">▼</span>
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-[#373737] border-2 border-[#1D1D1D] shadow-lg">
            {heroes.map((hero) => (
              <div 
                key={hero}
                onClick={() => handleSelect(hero)}
                className={`px-3 py-2 cursor-pointer flex items-center hover:bg-[#4A4A4A] ${
                  hero === value ? 'bg-[#4A4A4A]' : ''
                }`}
              >
                <span className={`inline-block w-4 h-4 mr-2 ${
                  hero === "Steve" ? "bg-[#8C6755]" : 
                  hero === "Alex" ? "bg-[#F47A42]" : 
                  hero === "Zombie" ? "bg-[#5A9950]" : 
                  hero === "Skeleton" ? "bg-[#D9D9D9]" : 
                  "bg-[#FFA500]"
                }`}></span>
                {hero}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}