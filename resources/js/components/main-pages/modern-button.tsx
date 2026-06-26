import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group transform perspective-1000",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-primary to-primary-light text-background shadow-button hover:shadow-neon hover:scale-105 border-0",
        secondary: "bg-gradient-glass backdrop-blur-sm text-foreground border border-primary/20 hover:bg-primary/10 hover:shadow-3d",
        ghost: "text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300",
        outline: "border-2 border-primary/30 text-foreground hover:border-primary/50 hover:bg-primary/10 hover:shadow-3d",
        gradient: "bg-gradient-hero text-background shadow-button hover:shadow-neon hover:scale-105 before:absolute before:inset-0 before:bg-gradient-neural before:opacity-0 before:transition-all before:duration-500 hover:before:opacity-100 before:animate-neural-pulse",
        glass: "bg-gradient-glass backdrop-blur-md border border-primary/30 text-foreground hover:bg-primary/10 hover:shadow-neon hover:border-primary/50",
      },
      size: {
        sm: "h-10 px-6 text-sm",
        default: "h-12 px-8",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-12 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {(variant === "primary" || variant === "gradient") && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Comp>
    )
  }
)
ModernButton.displayName = "ModernButton"

export { ModernButton, modernButtonVariants }