"use client";

import React from "react";

const heroes = ["Steve", "Alex", "Zombie", "Skeleton", "Custom"];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function HeroSelector({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-mono text-white">Choose your hero:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-gray-800 text-white p-2 font-mono border border-gray-500"
      >
        {heroes.map((hero) => (
          <option key={hero} value={hero}>
            {hero}
          </option>
        ))}
      </select>
    </div>
  );
}
