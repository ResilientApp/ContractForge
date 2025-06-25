import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
        outline: "text-gray-300 border-gray-600 bg-transparent hover:bg-gray-800/50",
        premium:
          "border-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg",
        warning:
          "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg",
        info:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg",
        glass:
          "border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg hover:bg-white/20",
        neon:
          "border-blue-500 bg-transparent text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 