"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number
}) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(Math.max(value ?? 0, 0), 100)}%`,
        }}
      />
    </div>
  )
}

export { Progress }