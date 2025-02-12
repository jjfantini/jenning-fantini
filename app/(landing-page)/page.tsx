import { LandingTerminal } from "./_components/terminal-intro";
import { AnimatedTitle } from "@/components/ui/animated-title";
import { AuroraText } from "@/components/ui/aurora-text";
export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <AnimatedTitle 
        text="Jennings Fantini"
        className="text-7xl font-bold text-neutral-600"
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
