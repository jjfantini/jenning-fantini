'use client'

import { motion } from "motion/react"
import { useState } from "react"

interface AnimatedTitleProps {
  text: string
  className?: string
}

export function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  const [isHovered, setIsHovered] = useState<number | null>(null)
  
  const getRandomEdgePosition = () => {
    const edges = [
      { x: -1000, y: Math.random() * 1000 - 500 }, // left
      { x: 1000, y: Math.random() * 1000 - 500 },  // right
      { x: Math.random() * 1000 - 500, y: -1000 }, // top
      { x: Math.random() * 1000 - 500, y: 1000 },  // bottom
    ]
    return edges[Math.floor(Math.random() * edges.length)]
  }

  const letterVariants = {
    initial: () => {
      const pos = getRandomEdgePosition()
      return {
        opacity: 0,
        x: pos.x,
        y: pos.y,
        scale: 3,
        rotate: Math.random() * 360,
      }
    },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: i * 0.1,
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    }),
    hover: {
      y: -10,
      rotate: Math.random() * 30 - 15,
      transition: {
        duration: 0.1,
        type: "spring",
        stiffness: 100,
        delay: 0, // Ensure no delay on hover
      },
    },
  }

  return (
    <div className={className}>
      {text.split("").map((char, i) => (
        char === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            initial="initial"
            animate="animate"
            variants={letterVariants}
            custom={i}
            whileHover="hover"
            onHoverStart={() => setIsHovered(i)}
            onHoverEnd={() => setIsHovered(null)}
            className="inline-block cursor-pointer"
            style={{
              color: isHovered === i ? 'var(--primary)' : 'inherit',
            }}
          >
            {char}
          </motion.span>
        )
      ))}
    </div>
  )
} 