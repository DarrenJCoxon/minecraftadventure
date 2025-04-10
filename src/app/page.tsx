"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroSelector from "@/components/HeroSelector";
import WorldSelector from "@/components/WorldSelector";

export default function HomePage() {
  const [hero, setHero] = useState("Steve");
  const [world, setWorld] = useState("Overworld");

  const router = useRouter();

  const handleStart = () => {
    // Pass selections as URL params (alternatively, use Context)
    const params = new URLSearchParams({
      hero,
      world,
    });
    router.push(`/adventure?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono text-white">
      <h1 className="text-4xl mb-6 font-bold">Minecraft Adventure</h1>
      <div className="max-w-xs w-full mb-6">
        <HeroSelector value={hero} onChange={setHero} />
        <WorldSelector value={world} onChange={setWorld} />
        <button
          onClick={handleStart}
          className="mt-4 w-full py-3 rounded bg-green-600 hover:bg-green-700 transition font-bold"
        >
          Start Adventure
        </button>
      </div>
    </main>
  );
}
