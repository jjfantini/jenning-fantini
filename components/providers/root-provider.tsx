"use client"

import * as React from "react"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "./tooltip-provider"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  )
}
