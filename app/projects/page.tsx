'use client'

import { AnimatedTitle } from "@/components/ui/animated-title"
import { MagicCard } from "@/components/ui/magic-card"
import TypingAnimation from "@/components/ui/typing-animation"
import { DATA } from "@/data/personal-details"

export default function ProjectsPage() {
  return (
    <main className="flex flex-col items-center justify-between">
      <div className="z-10 items-center justify-between font-mono text-sm">
        <AnimatedTitle 
          text="Projects" 
          className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-300"
        />
        <div className="grid gap-8">
          <TypingAnimation 
            className="text-lg text-neutral-900 dark:text-neutral-300"
            duration={50}
            delay={500}
            startOnView
          >
            Welcome to my projects page. Here you&apos;ll find a collection of my work.
          </TypingAnimation>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DATA.projects.map((project) => (
              <MagicCard 
                key={project.title} 
                className="p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white break-words">
                      <a href={project.href} target="_blank" rel="noopener noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-zinc-200/60 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100">
                      {project.private ? "Private" : "Public"}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-400">
                    {project.dates}
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-200">
                    {project.description}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-2 py-1 text-xs rounded-full bg-zinc-200/60 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
