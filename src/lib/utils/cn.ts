import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines clsx and tailwind-merge for conditional class names
 * @param inputs - Class names to merge
 * @returns Merged class name string
 */
export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs))
}