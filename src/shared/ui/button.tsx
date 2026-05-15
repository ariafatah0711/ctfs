import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold caret-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30",
        destructive:
          "bg-red-600 text-white shadow-sm shadow-red-500/20 hover:bg-red-500",
        outline:
          "border border-gray-200/80 bg-white/70 text-gray-700 shadow-sm backdrop-blur-md hover:border-blue-500/40 hover:bg-white hover:text-blue-600 dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-200 dark:hover:bg-[#151b2a] dark:hover:text-blue-300",
        secondary:
          "border border-gray-200/80 bg-gray-100/80 text-gray-800 shadow-sm hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-700 dark:border-gray-700/80 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
        ghost: "text-gray-700 hover:bg-blue-500/10 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
