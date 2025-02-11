import { TerminalDemo } from "./_components/terminal-intro";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl">
        <TerminalDemo />
      </div>
      <div className="text-4xl font-bold mb-8 text-mint-500">Jennings Fantini</div>
    </main>
  );
}
