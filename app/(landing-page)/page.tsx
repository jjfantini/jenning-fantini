import { TerminalIntro } from "./_components/terminal-intro";
import { AuroraText } from "@/components/ui/aurora-text";
import { RepellingText } from "./_components/repelling-title";
import { ChasingLogo } from "./_components/chasing-logo";

export default function LandingPage() {
  return (
    <>
      <ChasingLogo />
      <div className="flex flex-col items-center justify-center p-4 gap-8">
        <span>
          <RepellingText 
            text="Jennings Fantini"
            className="max-w-4xl text-4xl md:text-6xl lg:text-8xl font-bold text-neutral-900 dark:text-neutral-100"
            />
        </span>
        <span className="max-w-4xl">
          <TerminalIntro />
        </span>

        <span className="font-bold tracking-tighter text-4xl md:text-6xl lg:text-7xl">
          <p><AuroraText>execute.</AuroraText></p>
        </span>
      </div>
    </>
  );
}
