import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-[var(--dur-soft)] ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-gold-orb focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-orb text-ink-deep hover:bg-gold-warm hover:scale-[1.02] hover:shadow-[var(--elev-orb)]",
        ghost:
          "bg-transparent text-sand border border-hairline-up hover:border-gold-orb hover:text-gold-orb",
        link: "bg-transparent text-tan hover:text-gold-orb underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-4 text-[14px]",
        md: "h-11 px-6 text-[15px]",
        lg: "h-13 px-8 text-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
