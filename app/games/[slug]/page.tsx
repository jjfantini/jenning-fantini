'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import SnakeGame from "../_components/SnakeGame"

// Define the games available in our application
const games = {
  snake: {
    title: "Snake Game",
    description: "Control the snake, eat the food, and avoid hitting the walls or yourself!",
    component: SnakeGame
  }
  // Add more games here in the future
}

// Define types for the page props and unwrapped params
type Props = {
  params: Promise<{
    slug: string
  }>
}

type UnwrappedParams = {
  slug: string
}

export default function GamePage({ params }: Props) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params) as UnwrappedParams
  const { slug } = unwrappedParams
  
  // Get the game data based on the slug
  const gameData = games[slug as keyof typeof games]
  
  // If the game doesn't exist, return 404
  if (!gameData) {
    notFound()
  }
  
  const GameComponent = gameData.component
  
  return (
    <div className="flex flex-col items-center justify-between p-2 md:p-8 z-10 font-mono text-sm" suppressHydrationWarning>
      <AnimatedTitle 
        text={gameData.title} 
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
            {gameData.description}
          </TypingAnimation>
        </div>
        
        <div className="max-w-3xl mx-auto w-full mt-4">
          <GameComponent />
        </div>
      </div>
      <div className="h-30 sm:h-20" />
    </div>
  )
} 