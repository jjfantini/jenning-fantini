"use client"

import * as React from "react"
import { TooltipProvider as UITooltipProvider } from "@/components/ui/tooltip"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <UITooltipProvider>{children}</UITooltipProvider>
}

