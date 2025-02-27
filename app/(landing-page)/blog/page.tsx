'use client'

import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import { motion } from "motion/react"
import { Sparkles, Newspaper, Calendar, ArrowRight } from "lucide-react"

export default function BlogPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <AnimatedTitle 
          text="Blog" 
          className="text-5xl md:text-6xl font-bold mb-6 text-neutral-900 dark:text-neutral-200"
        />
        
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-4xl md:text-5xl"
          >
            ✨ 📝 🚀
          </motion.div>
        </div>
        
        <div className="h-24 flex items-center justify-center mb-8">
          <TypingAnimation 
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300"
            duration={40}
            delay={800}
            startOnView
          >
            Exciting content coming soon...
          </TypingAnimation>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="grid gap-6 md:grid-cols-3 mt-12"
        >
          {[
            { icon: Newspaper, title: "Articles", description: "In-depth technical guides" },
            { icon: Sparkles, title: "Tutorials", description: "Step-by-step walkthroughs" },
            { icon: Calendar, title: "Updates", description: "Regular new content" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.8 + index * 0.2 }}
              className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <item.icon className="h-10 w-10 mb-4 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-medium mb-2 text-neutral-800 dark:text-neutral-200">{item.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="mt-12 text-neutral-600 dark:text-neutral-400"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            Check back soon for the first post
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
