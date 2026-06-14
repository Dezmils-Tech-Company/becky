/**
 * Converts a string to a URL-friendly slug
 * @param text - Input string to slugify
 * @returns URL-friendly slug string
 *
 * Example: "Hello World!" → "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word, non-space, non-hyphen chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}