'use client'

import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import SnakeGame from "./_components/SnakeGame"

export default function GamesPage() {
  return (
    <div className="flex flex-col items-center justify-between p-2 md:p-8 z-10 font-mono text-sm" suppressHydrationWarning>
      <AnimatedTitle 
        text="Games" 
        className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-300"
      />
      <div className="grid gap-y-1">
        <div className="flex justify-center h-[4rem]">
          <TypingAnimation 
            className="text-lg text-neutral-900 dark:text-neutral-300 text-center"
            duration={50}
            delay={500}
            startOnView
          >
            Take a break and have some fun with these interactive games!
          </TypingAnimation>
        </div>
        
        <div className="max-w-3xl mx-auto w-full mt-4">
          <SnakeGame />
        </div>
      </div>
      <div className="h-30 sm:h-20" />
    </div>
  )
}
