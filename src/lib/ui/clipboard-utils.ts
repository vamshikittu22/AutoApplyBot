/**
 * Clipboard Utilities
 * Copy-to-clipboard functionality with fallback support
 */

/**
 * Copy text to clipboard using Clipboard API
 * Falls back to document.execCommand if Clipboard API not available
 *
 * @param text - Text to copy
 * @returns Promise resolving to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log('[Clipboard] Copied using Clipboard API');
      return true;
    }

    // Fallback to execCommand
    return copyWithExecCommand(text);
  } catch (error) {
    console.error('[Clipboard] Copy failed:', error);
    return false;
  }
}

/**
 * Copy text with visual feedback
 * Returns promise that resolves after feedback animation
 */
export async function copyWithFeedback(
  text: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<boolean> {
  const success = await copyToClipboard(text);

  if (success) {
    onSuccess?.();
  } else {
    onError?.();
  }

  return success;
}

/**
 * Fallback copy method using execCommand (deprecated but widely supported)
 */
function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    console.log('[Clipboard] Copied using execCommand:', successful);
    return successful;
  } catch (error) {
    document.body.removeChild(textarea);
    console.error('[Clipboard] execCommand failed:', error);
    return false;
  }
}

/**
 * Check if Clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && window.isSecureContext);
}

/**
 * Format profile data for copy
 */
export function formatForCopy(data: any): string {
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === 'object') {
          return Object.values(item).join(' | ');
        }
        return String(item);
      })
      .join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  return String(data);
}
