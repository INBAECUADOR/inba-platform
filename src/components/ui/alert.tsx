"use client"

import * as React from "react"
import { cn } from "@/utils/cn"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"

const alertVariants = {
  default: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-green-500/10 text-green-700 border-green-500/20",
  info: "bg-blue-500/10 text-blue-700 border-blue-500/20",
}

const icons = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  info: Info,
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const Icon = icons[variant]
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
          alertVariants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <div className="ml-6">
          <slot />
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }