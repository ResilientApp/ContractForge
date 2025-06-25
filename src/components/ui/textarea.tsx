import * as React from "react"

import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative group">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border-2 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500",
            "focus:border-blue-500/50 focus:bg-gray-800/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20",
            "transition-all duration-300 ease-out resize-none",
            "hover:border-gray-500/70 hover:bg-gray-800/40",
            "font-mono leading-relaxed",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 