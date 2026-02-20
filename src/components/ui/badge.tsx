import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color,transform] duration-200 ease-out motion-reduce:transition-none overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-95 [button&]:cursor-pointer",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 active:scale-95 [button&]:cursor-pointer",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 active:scale-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 [button&]:cursor-pointer",
        outline:
          "border-border text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95 [button&]:cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95 [button&]:cursor-pointer",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80 [button&]:cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
