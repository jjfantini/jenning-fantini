import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export function TerminalIntro() {
  return (
    <Terminal>
      <TypingAnimation>&gt; pnpm add Jennings Fantini</TypingAnimation>

      <AnimatedSpan delay={1500} className="text-green-500">
        <span>✔ Loading skills. Found 25.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2000} className="text-green-500">
        <span>✔ Verifying Humanity. Verified.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2500} className="text-green-500">
        <span>✔ Validating Ambition. Validated.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={3500} className="text-green-500">
        <span>✔ Uploading persona. Finished.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={4000} className="text-green-500">
        <span>✔ Checking registry.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={4500} className="text-green-500">
        <span>✔ Updating opinions.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={5000} className="text-green-500">
        <span>✔ Updating knowledge.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={5500} className="text-green-500">
        <span>✔ Installing drive.</span>
      </AnimatedSpan>

      <AnimatedSpan delay={6000} className="text-blue-500">
        <span>ℹ Create one human:</span>
        <span className="pl-2">- System Rebooted.</span>
      </AnimatedSpan>

      <TypingAnimation delay={6500} className="text-muted-foreground">
        Success! Human created.
      </TypingAnimation>

      <TypingAnimation delay={7000} className="text-muted-foreground">
        You may now explore Jennings.
      </TypingAnimation>
    </Terminal>
  );
}
