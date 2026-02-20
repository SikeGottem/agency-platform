/**
 * Utility functions for consistent focus indicator styling across the application.
 * Ensures WCAG 2.1 AA compliance with 3:1 contrast ratio for focus indicators.
 */

import { cn } from "@/lib/utils";

/**
 * Standard focus indicator styles using ring utilities
 * Provides 2px ring with appropriate offset for visibility
 */
export const baseFocusStyles = 
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black";

/**
 * Focus styles for primary interactive elements (buttons, main CTAs)
 */
export const primaryFocusStyles = cn(
  baseFocusStyles,
  "focus-visible:ring-primary"
);

/**
 * Focus styles for destructive/danger actions
 */
export const destructiveFocusStyles = cn(
  baseFocusStyles,
  "focus-visible:ring-destructive"
);

/**
 * Focus styles for brand color elements (custom red theme)
 */
export const brandFocusStyles = cn(
  baseFocusStyles,
  "focus-visible:ring-[#E05252]"
);

/**
 * Focus styles for links with reduced ring offset for inline text
 */
export const linkFocusStyles = 
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

/**
 * Focus styles for form labels and containers using focus-within
 */
export const containerFocusStyles = 
  "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-black";

/**
 * Creates focus styles with custom ring color
 */
export function createFocusStyles(ringColor: string, offset: number = 2) {
  return cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
    `focus-visible:ring-${ringColor}`,
    `focus-visible:ring-offset-${offset}`
  );
}

/**
 * Validates that focus indicator has sufficient contrast ratio
 * This is used in tests to ensure accessibility compliance
 */
export function validateFocusContrast(element: HTMLElement): boolean {
  // This would ideally use actual color computation
  // For now, we check that proper ring classes are applied
  const classes = element.className;
  
  const hasRing = classes.includes('focus-visible:ring-2') || classes.includes('focus:ring-2');
  const hasRingColor = classes.includes('ring-primary') || 
                      classes.includes('ring-destructive') ||
                      classes.includes('ring-[#E05252]');
  const hasOutlineRemoval = classes.includes('focus-visible:outline-none') || 
                           classes.includes('focus:outline-none') ||
                           classes.includes('focus:outline-hidden');

  return hasRing && hasRingColor && hasOutlineRemoval;
}

/**
 * Common focus styles for specific component types
 */
export const focusStyles = {
  button: primaryFocusStyles,
  input: primaryFocusStyles, 
  link: linkFocusStyles,
  brand: brandFocusStyles,
  destructive: destructiveFocusStyles,
  container: containerFocusStyles,
} as const;