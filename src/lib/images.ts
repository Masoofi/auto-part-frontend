/** Mirrors the backend upload rules (products.controller.ts). */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Returns an error message, or null when the file is acceptable. */
export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG or WebP images are allowed.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller.'
  return null
}
