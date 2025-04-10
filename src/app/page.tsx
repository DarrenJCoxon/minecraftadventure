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
    // Pass selections as URL params
    const params = new URLSearchParams({
      hero,
      world,
    });
    router.push(`/adventure?${params.toString()}`);
  };

  // Define background image for grid pattern
  const gridBgStyle = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z'/%3E%3C/g%3E%3C/svg%3E\")",
    backgroundSize: "40px 40px"
  };

  // Define character background images
  const steveStyle = {
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iIzczNWI0YyIgZD0iTTEyIDRoMTZ2OEgxMnoiLz48cGF0aCBmaWxsPSIjOGM2NzU1IiBkPSJNMTIgMTJoMTZ2MTBIMTJeiLz48cGF0aCBmaWxsPSIjNjA0MjI4IiBkPSJNMTIgMTJoNHYxMGgtNHoiLz48cGF0aCBmaWxsPSIjMTM2N2E5IiBkPSJNOCAyMmg4djE0SDh6Ii8+PHBhdGggZmlsbD0iIzEyNWE5ZSIgZD0iTTggMjJoNHYxNEg4eiIvPjxwYXRoIGZpbGw9IiMwNTRlOTciIGQ9Ik04IDIyaDR2MTBIOHoiLz48cGF0aCBmaWxsPSIjM2I4ZTNmIiBkPSJNMjQgMjJoOHYxNGgtOHoiLz48cGF0aCBmaWxsPSIjMmU3ZTMxIiBkPSJNMjQgMjJoNHYxNGgtNHoiLz48cGF0aCBmaWxsPSIjMjY2YzI3IiBkPSJNMjQgMjJoNHYxMGgtNHoiLz48cGF0aCBmaWxsPSIjNmI2YjZiIiBkPSJNMTYgMjJoOHY2aC04eiIvPjxwYXRoIGZpbGw9IiM1OTU5NTkiIGQ9Ik0xNiAyMmg0djZoLTR6Ii8+PHBhdGggZmlsbD0iIzQ2NDY0NiIgZD0iTTE2IDIyaDR2NGgtNHoiLz48L3N2Zz4=')",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  };
  
  const alexStyle = {
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI2VhOWE3MCIgZD0iTTEyIDRoMTZ2OEgxMnoiLz48cGF0aCBmaWxsPSIjZjQ3YTQyIiBkPSJNMTIgMTJoMTZ2MTBIMTJ6Ii8+PHBhdGggZmlsbD0iI2QyNWMzMyIgZD0iTTEyIDEyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iIzYyOWVlNSIgZD0iTTggMjJoOHYxNEg4eiIvPjxwYXRoIGZpbGw9IiM0ZjhjY2EiIGQ9Ik04IDIyaDR2MTRIOHoiLz48cGF0aCBmaWxsPSIjM2Y3NGEyIiBkPSJNOCAyMmg0djEwSDh6Ii8+PHBhdGggZmlsbD0iIzM4ODIzYiIgZD0iTTI0IDIyaDh2MTRoLTh6Ii8+PHBhdGggZmlsbD0iIzJjNjYyZCIgZD0iTTI0IDIyaDR2MTRoLTR6Ii8+PHBhdGggZmlsbD0iIzI2NWEyNyIgZD0iTTI0IDIyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iIzU2NTY1NiIgZD0iTTE2IDIyaDh2NmgtOHoiLz48cGF0aCBmaWxsPSIjNGE0YTRhIiBkPSJNMTYgMjJoNHY2aC00eiIvPjxwYXRoIGZpbGw9IiMzZDNkM2QiIGQ9Ik0xNiAyMmg0djRoLTR6Ii8+PC9zdmc+')",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  };
  
  const zombieStyle = {
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iIzU5OTk1MCIgZD0iTTEyIDRoMTZ2OEgxMnoiLz48cGF0aCBmaWxsPSIjNzRiODZhIiBkPSJNMTIgMTJoMTZ2MTBIMTJ6Ii8+PHBhdGggZmlsbD0iIzRjODM0NCIgZD0iTTEyIDEyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iIzVhOTk1MCIgZD0iTTggMjJoOHYxNEg4eiIvPjxwYXRoIGZpbGw9IiM0YzgzNDQiIGQ9Ik04IDIyaDR2MTRIOHoiLz48cGF0aCBmaWxsPSIjNDE3MTM5IiBkPSJNOCAyMmg0djEwSDh6Ii8+PHBhdGggZmlsbD0iIzVhOTk1MCIgZD0iTTI0IDIyaDh2MTRoLTh6Ii8+PHBhdGggZmlsbD0iIzRjODM0NCIgZD0iTTI0IDIyaDR2MTRoLTR6Ii8+PHBhdGggZmlsbD0iIzQxNzEzOSIgZD0iTTI0IDIyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iIzc0Yjg2YSIgZD0iTTE2IDIyaDh2NmgtOHoiLz48cGF0aCBmaWxsPSIjNjBhMTU3IiBkPSJNMTYgMjJoNHY2aC00eiIvPjxwYXRoIGZpbGw9IiM1Mjg5NDciIGQ9Ik0xNiAyMmg0djRoLTR6Ii8+PC9zdmc+')",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  };
  
  const skeletonStyle = {
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI2QwZDBkMCIgZD0iTTEyIDRoMTZ2OEgxMnoiLz48cGF0aCBmaWxsPSIjZTdlN2U3IiBkPSJNMTIgMTJoMTZ2MTBIMTJ6Ii8+PHBhdGggZmlsbD0iI2IyYjJiMiIgZD0iTTEyIDEyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iI2Q5ZDlkOSIgZD0iTTggMjJoOHYxNEg4eiIvPjxwYXRoIGZpbGw9IiNiMmIyYjIiIGQ9Ik04IDIyaDR2MTRIOHoiLz48cGF0aCBmaWxsPSIjYThhOGE4IiBkPSJNOCAyMmg0djEwSDh6Ii8+PHBhdGggZmlsbD0iI2Q5ZDlkOSIgZD0iTTI0IDIyaDh2MTRoLTh6Ii8+PHBhdGggZmlsbD0iI2IyYjJiMiIgZD0iTTI0IDIyaDR2MTRoLTR6Ii8+PHBhdGggZmlsbD0iI2E4YThhOCIgZD0iTTI0IDIyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iI2M1YzVjNSIgZD0iTTE2IDIyaDh2NmgtOHoiLz48cGF0aCBmaWxsPSIjYThhOGE4IiBkPSJNMTYgMjJoNHY2aC00eiIvPjxwYXRoIGZpbGw9IiM5OTk5OTkiIGQ9Ik0xNiAyMmg0djRoLTR6Ii8+PC9zdmc+')",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  };
  
  const customStyle = {
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI2ZmY2MzMyIgZD0iTTEyIDRoMTZ2OEgxMnoiLz48cGF0aCBmaWxsPSIjZmZhNTAwIiBkPSJNMTIgMTJoMTZ2MTBIMTJ6Ii8+PHBhdGggZmlsbD0iI2ZmODMwMCIgZD0iTTEyIDEyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iI2RkMmM5OSIgZD0iTTggMjJoOHYxNEg4eiIvPjxwYXRoIGZpbGw9IiNjNjFjOGMiIGQ9Ik04IDIyaDR2MTRIOHoiLz48cGF0aCBmaWxsPSIjYWYwOTdiIiBkPSJNOCAyMmg0djEwSDh6Ii8+PHBhdGggZmlsbD0iIzRhNzJjNCIgZD0iTTI0IDIyaDh2MTRoLTh6Ii8+PHBhdGggZmlsbD0iIzM5NjFiMyIgZD0iTTI0IDIyaDR2MTRoLTR6Ii8+PHBhdGggZmlsbD0iIzMyNTVhNCIgZD0iTTI0IDIyaDR2MTBoLTR6Ii8+PHBhdGggZmlsbD0iIzhjYTNkYyIgZD0iTTE2IDIyaDh2NmgtOHoiLz48cGF0aCBmaWxsPSIjNmY4Y2NlIiBkPSJNMTYgMjJoNHY2aC00eiIvPjxwYXRoIGZpbGw9IiM1MTcxYzEiIGQ9Ik0xNiAyMmg0djRoLTR6Ii8+PC9zdmc+')",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  };

  return (
    <main className="min-h-screen bg-[#282828] flex flex-col items-center justify-center p-4 font-mono text-white relative overflow-hidden">
      {/* Background grid pattern for a "blocky" Minecraft feel */}
      <div className="absolute inset-0 w-full h-full bg-black opacity-20" style={gridBgStyle}>
      </div>

      {/* Decorative elements resembling Minecraft blocks */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-[#7b5d3f] shadow-lg transform -rotate-6 opacity-60"></div>
      <div className="absolute bottom-20 right-14 w-20 h-20 bg-[#5d8a57] shadow-lg transform rotate-12 opacity-60"></div>
      <div className="absolute top-40 right-28 w-14 h-14 bg-[#737373] shadow-lg transform rotate-3 opacity-60"></div>
      <div className="absolute bottom-32 left-24 w-24 h-24 bg-[#6e6e6e] shadow-lg transform -rotate-12 opacity-60"></div>

      {/* Main content area */}
      <div className="relative z-10 w-full max-w-md px-8 py-10 bg-[#3A3A3A] rounded-lg border-4 border-[#1D1D1D] shadow-2xl">
        <h1 className="text-4xl mb-8 font-bold text-center text-[#55FF55] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          MINECRAFT ADVENTURE
        </h1>

        <div className="mb-8">
          <HeroSelector value={hero} onChange={setHero} />
          <WorldSelector value={world} onChange={setWorld} />
        </div>

        {/* Minecraft-style button with hover effect */}
        <button
          onClick={handleStart}
          className="w-full max-w-xs mx-auto block py-3 px-4 text-white font-bold text-center uppercase tracking-wide
                     bg-[#4a7a46] hover:bg-[#3b8f3e] border-b-4 border-t-2 border-l-2 border-r-2 
                     border-b-[#2d4b2b] border-t-[#69aa64] border-l-[#69aa64] border-r-[#2d4b2b]
                     hover:border-b-[#2d4b2b] hover:border-t-[#87d682] hover:border-l-[#87d682] hover:border-r-[#2d4b2b]
                     active:translate-y-1 active:border-b-2 active:border-t-4 
                     rounded-none transition-all shadow-lg"
        >
          Start Adventure
        </button>

        {/* Character display based on selected hero */}
        <div className="mt-10 flex justify-center">
          <div className="w-32 h-32 relative grayscale-[30%] hover:grayscale-0 transition-all duration-300">
            {hero === "Steve" && (
              <div className="w-full h-full" style={steveStyle}></div>
            )}
            {hero === "Alex" && (
              <div className="w-full h-full" style={alexStyle}></div>
            )}
            {hero === "Zombie" && (
              <div className="w-full h-full" style={zombieStyle}></div>
            )}
            {hero === "Skeleton" && (
              <div className="w-full h-full" style={skeletonStyle}></div>
            )}
            {hero === "Custom" && (
              <div className="w-full h-full" style={customStyle}></div>
            )}
          </div>
        </div>

        {/* Minecraft crafting table at the bottom */}
        <div className="mt-10 flex justify-center">
          <div className="w-8 h-8 bg-[#7E5D38] border-2 border-[#5C4425] rounded-sm"></div>
        </div>
      </div>
    </main>
  );
}