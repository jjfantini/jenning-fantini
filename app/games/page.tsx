'use client'

import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import Link from "next/link"
import { motion } from "motion/react"

// Define available games
const games = [
  {
    slug: "snake",
    title: "Snake Game",
    description: "Control the snake, eat the food, and avoid hitting the walls or yourself!",
    color: "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-300",
    textColor: "text-white dark:text-neutral-900"
  },
  {
    slug: "tetris",
    title: "Tetris",
    description: "Stack falling tetriminos and clear lines to score points in this classic puzzle game!",
    color: "bg-purple-500 hover:bg-purple-600 dark:bg-purple-400 dark:hover:bg-purple-300",
    textColor: "text-white dark:text-neutral-900"
  }
  // Add more games here in the future
]

export default function GamesPage() {
  return (
    <div className="flex flex-col items-center justify-between p-2 md:p-8 z-10 font-mono text-sm" suppressHydrationWarning>
      <AnimatedTitle 
        text="Games" 
        className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-300"
      />
      
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex justify-center h-[4rem] mb-8">
          <TypingAnimation 
            className="text-lg text-neutral-900 dark:text-neutral-300 text-center"
            duration={50}
            delay={500}
            startOnView
          >
            Choose a game to play and have fun!
          </TypingAnimation>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <Link href={`/games/${game.slug}`} key={game.slug}>
              <motion.div
                className={`${game.color} ${game.textColor} p-6 rounded-lg shadow-lg cursor-pointer transition-transform`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                <p className="text-sm opacity-90">{game.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="h-30 sm:h-20" />
    </div>
  )
}
