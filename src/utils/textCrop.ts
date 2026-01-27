/**
 * Text cropping utilities for run name display
 */
import type { RunNameCropMode } from '@/types/workspace';

/**
 * Crop text based on the specified mode
 *
 * @param text - The text to crop
 * @param maxLength - Maximum character length before cropping
 * @param mode - Crop mode: 'end' | 'middle' | 'beginning'
 * @returns Cropped text with ellipsis
 *
 * @example
 * cropText('very_long_name_here', 15, 'end') // "very_long_name..."
 * cropText('very_long_name_here', 15, 'middle') // "very_lo...e_here"
 * cropText('very_long_name_here', 15, 'beginning') // "...ng_name_here"
 */
export function cropText(
  text: string,
  maxLength: number,
  mode: RunNameCropMode = 'end'
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const ellipsis = '...';
  const ellipsisLength = ellipsis.length;

  switch (mode) {
    case 'end':
      // Show beginning, crop end: "very_long_na..."
      return text.slice(0, maxLength - ellipsisLength) + ellipsis;

    case 'middle': {
      // Show beginning and end, crop middle: "very_...name"
      const availableChars = maxLength - ellipsisLength;
      const startChars = Math.ceil(availableChars / 2);
      const endChars = Math.floor(availableChars / 2);
      return text.slice(0, startChars) + ellipsis + text.slice(-endChars);
    }

    case 'beginning':
      // Show end, crop beginning: "...long_name"
      return ellipsis + text.slice(-(maxLength - ellipsisLength));

    default:
      return text.slice(0, maxLength - ellipsisLength) + ellipsis;
  }
}

/**
 * Get CSS class for crop mode (for CSS-based ellipsis)
 * Note: CSS can only handle 'end' cropping with text-overflow: ellipsis
 * For 'middle' and 'beginning', we need JavaScript-based cropping
 */
export function getCropModeClass(mode: RunNameCropMode): string {
  return `crop-mode-${mode}`;
}

/**
 * Check if crop mode requires JavaScript-based cropping
 * (CSS text-overflow: ellipsis only supports end cropping)
 */
export function needsJsCropping(mode: RunNameCropMode): boolean {
  return mode === 'middle' || mode === 'beginning';
}
