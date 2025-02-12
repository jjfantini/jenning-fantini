import { LandingTerminal } from "./_components/terminal-intro";
import { AnimatedTitle } from "@/components/ui/animated-title";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <AnimatedTitle 
        text="Jennings Fantini"
        className="text-7xl font-bold text-mint-500"
      />
      <div className="max-w-3xl">
        <LandingTerminal />
      </div>
    </main>
  );
}
