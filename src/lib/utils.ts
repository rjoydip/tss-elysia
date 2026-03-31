import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that merges Tailwind CSS classes using clsx and tailwind-merge.
 * Handles conflicting class names by prioritizing the last occurrence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to title case.
 * e.g. "api reference" -> "Api Reference"
 * e.g. "ci cd"         -> "Ci Cd"
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Brand color utility functions
 * All brand colors use CSS variables for easy theming:
 * - --brand: Main brand color
 * - --brand-foreground: Text color on brand background
 * - --brand-hover: Hover state color
 */
export const brand = {
  /**
   * Returns Tailwind classes for brand background color
   */
  bg: "bg-[--brand]",
  /**
   * Returns Tailwind classes for brand text color
   */
  text: "text-[--brand]",
  /**
   * Returns Tailwind classes for brand border color
   */
  border: "border-[--brand]",
  /**
   * Returns Tailwind classes for brand hover background
   */
  hover: "hover:bg-[--brand-hover]",
  /**
   * Returns Tailwind classes for brand foreground (text on brand bg)
   */
  foreground: "text-[--brand-foreground]",
  /**
   * Returns Tailwind classes for brand with hover state
   */
  bgHover: "bg-[--brand] hover:bg-[--brand-hover]",
  /**
   * Returns Tailwind classes for ring color
   */
  ring: "ring-[--brand]",
};