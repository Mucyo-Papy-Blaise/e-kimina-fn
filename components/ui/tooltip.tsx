"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

export interface TooltipProps {
  children: React.ReactElement
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  disabled?: boolean
}

function Tooltip({ children, content, side = "right", disabled }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  if (disabled) return children

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg whitespace-nowrap",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2"
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export { Tooltip }
