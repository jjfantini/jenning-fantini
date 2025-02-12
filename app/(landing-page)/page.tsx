'use client'

import { LandingTerminal } from "./_components/terminal-intro";
import { AuroraText } from "@/components/ui/aurora-text";
import { RepellingText } from "./_components/repelling-text";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 gap-8 mt-10">
      <RepellingText 
        text="Jennings Fantini"
        className="text-7xl font-bold text-mint-500"
      />
      <div className="max-w-4xl">
        <LandingTerminal />

        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
          <AuroraText>create.</AuroraText>
        </h1>
      </div>
    </main>
  );
}
