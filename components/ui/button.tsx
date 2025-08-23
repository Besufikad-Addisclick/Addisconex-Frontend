import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        info: 'bg-blue-600 text-white hover:bg-blue-700',
        gradient:
          'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90',
        glass:
          'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20',
        neon:
          'bg-transparent text-primary border border-primary hover:shadow-[0_0_10px] hover:shadow-primary',
        darkGreen: 'bg-green-800 text-white hover:bg-green-900',
        purple: 'bg-purple-600 text-white hover:bg-purple-700',
        teal: 'bg-teal-600 text-white hover:bg-teal-700',
        pink: 'bg-pink-600 text-white hover:bg-pink-700',
        orange: 'bg-orange-600 text-white hover:bg-orange-700',
        slate: 'bg-slate-600 text-white hover:bg-slate-700',
        soft: 'bg-primary/10 text-primary hover:bg-primary/20',
        muted: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        sky: 'bg-[#95BAD7] text-white hover:bg-[#7FA8C9]',
        blue: 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        xl: 'h-12 rounded-md px-10 text-lg',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
        iconLg: 'h-12 w-12',
      },
      rounded: {
        default: 'rounded-md',
        none: 'rounded-none',
        full: 'rounded-full',
        sm: 'rounded-sm',
        lg: 'rounded-lg',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'hover:animate-bounce',
        scale: 'hover:scale-105 active:scale-95 transition-transform',
        glow: 'hover:shadow-[0_0_15px] hover:shadow-primary/50 transition-shadow',
      },
      loading: {
        default: '',
        spinner:
          'relative text-transparent hover:text-transparent before:content-[""] before:absolute before:w-4 before:h-4 before:border-2 before:border-t-transparent before:border-white before:rounded-full before:animate-spin',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      animation: 'none',
      loading: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, rounded, animation, loading, asChild = false, isLoading = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const finalLoading = isLoading ? 'spinner' : loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, rounded, animation, loading: finalLoading, className })
        )}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };