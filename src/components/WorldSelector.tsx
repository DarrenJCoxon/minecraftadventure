"use client";

import React from "react";

const worlds = ["Overworld", "Nether", "The End", "Jungle", "Ice Plains", "Desert Temple"];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function WorldSelector({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-mono text-white">Choose your world:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-gray-800 text-white p-2 font-mono border border-gray-500"
      >
        {worlds.map((world) => (
          <option key={world} value={world}>
            {world}
          </option>
        ))}
      </select>
    </div>
  );
}
