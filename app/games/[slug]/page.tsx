'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import SnakeGame from "../_components/SnakeGame"
import TetrisGame from "../_components/TetrisGame"
import { useIsMobile } from "@/lib/hooks/use-mobile-device"

// Define the games available in our application
const games = {
  snake: {
    title: "Snake Game",
    description: "Control the snake, eat the food, and avoid hitting the walls or yourself!",
    component: SnakeGame
  },
  tetris: {
    title: "Tetris",
    description: "Stack falling tetriminos and clear lines to score points in this classic puzzle game!",
    component: TetrisGame
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
  const isMobile = useIsMobile()
  
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
        className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-4 md:mb-8 text-neutral-900 dark:text-neutral-300`}
      />
      <div className="grid gap-y-1 w-full">
        <div className={`flex justify-center ${isMobile ? 'h-[5rem]' : 'h-[4rem]'}`}>
          <TypingAnimation 
            className={`${isMobile ? 'text-sm' : 'text-lg'} text-neutral-900 dark:text-neutral-300 text-center px-2`}
            duration={50}
            delay={500}
            startOnView
          >
            {gameData.description}
          </TypingAnimation>
        </div>
        
        <div className="w-full mt-2 md:mt-4">
          <GameComponent />
        </div>
      </div>
      <div className={`${isMobile ? 'h-20' : 'h-30 sm:h-20'}`} />
    </div>
  )
} 