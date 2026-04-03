/**
 * Input Component
 * Reusable text input with consistent styling.
 * Follows shadcn/ui design patterns with Tailwind CSS.
 */

import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * Input component props extending native HTML input attributes.
 * Supports all standard input types and custom className.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component for text entry.
 * Provides consistent styling across the application.
 * Supports all native input attributes and types.
 *
 * @example
 * // Basic text input
 * <Input type="text" placeholder="Enter your name" />
 *
 * // Password input
 * <Input type="password" placeholder="Enter password" />
 *
 * // With custom styling
 * <Input className="border-primary" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };