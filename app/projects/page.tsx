'use client'

import { GlowingEffect } from "@/components/ui/glowing-effect"
import { AnimatedTitle } from "@/components/ui/animated-title"
import TypingAnimation from "@/components/ui/typing-animation"
import { DATA } from "@/data/personal-details"
import { motion } from "motion/react"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-between p-2 md:p-8 z-10 font-mono text-sm" suppressHydrationWarning>
      <AnimatedTitle 
        text="Projects" 
        className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-300"
      />
      <div className="grid gap-8">
        <div className="flex justify-center">
          <TypingAnimation 
            className="text-lg text-neutral-900 dark:text-neutral-300 text-center"
            duration={50}
            delay={500}
            startOnView
          >
            Welcome to my projects page. Here you&apos;ll find a collection of my work.
          </TypingAnimation>
        </div>
        <motion.ul 
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {DATA.projects.map((project) => (
            <GridItem
              key={project.title}
              area=""
              icon={project.icon}
              title={project.title}
              description={project.description}
              href={project.href}
              isPrivate={project.private}
              dates={project.dates}
              technologies={project.technologies}
              borderColor={project.borderColor}
            />
          ))}
        </motion.ul>
      </div>
    </div>
  )
}

interface GridItemProps {
  area?: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  href: string
  isPrivate: boolean
  dates: string
  technologies: readonly string[]
  borderColor?: string
}

const GridItem = ({ area = "", icon, title, description, href, isPrivate, dates, technologies, borderColor = "border-gray-600 dark:border-gray-600" }: GridItemProps) => {
  return (
    <motion.li 
      className={`min-h-[14rem] list-none ${area}`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={30}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6 bg-zinc-100/65 dark:bg-transparent dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
          <div className="relative flex flex-1 flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className={`w-fit rounded-lg border ${borderColor} p-2`}>
                {icon}
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-zinc-200/60 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100">
                {isPrivate ? "Private" : "Public"}
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance">
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white transition-colors duration-300 hover:text-emerald-500 dark:hover:text-emerald-400">
                  {title}
                </a>
              </h3>
              <div className="text-sm text-zinc-700 dark:text-zinc-400">
                {dates}
              </div>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] md:text-base/[1.375rem] text-black dark:text-neutral-400">
                {description}
              </h2>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-2 py-1 text-xs rounded-full bg-zinc-200/60 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  )
}
