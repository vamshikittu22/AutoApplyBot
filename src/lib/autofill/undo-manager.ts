import type { DetectedField } from '@/types/autofill';
import { setFieldValue } from './field-filler';

/**
 * Undo history entry
 */
interface UndoEntry {
  field: DetectedField;
  originalValue: string;
  newValue: string;
  timestamp: number;
}

/**
 * Undo manager for autofill operations
 * Tracks original values and allows reverting changes
 */
export class UndoManager {
  private history: Map<HTMLElement, UndoEntry> = new Map();
  private maxHistorySize = 100;

  /**
   * Record a field change for undo
   */
  record(field: DetectedField, originalValue: string, newValue: string): void {
    const entry: UndoEntry = {
      field,
      originalValue,
      newValue,
      timestamp: Date.now(),
    };

    this.history.set(field.element, entry);

    // Limit history size
    if (this.history.size > this.maxHistorySize) {
      const oldestKey = Array.from(this.history.keys())[0];
      if (oldestKey) {
        this.history.delete(oldestKey);
      }
    }
  }

  /**
   * Undo a single field change
   */
  undoField(element: HTMLElement): boolean {
    const entry = this.history.get(element);
    if (!entry) {
      console.warn('[UndoManager] No undo history for field');
      return false;
    }

    try {
      // Restore original value
      const success = setFieldValue(entry.field.element, entry.originalValue, entry.field.type);
      if (!success) return false;

      // Fire events
      fireFieldEvents(entry.field.element);

      // Remove from history
      this.history.delete(element);

      console.log('[UndoManager] Undone field:', entry.field.label);
      return true;
    } catch (error) {
      console.error('[UndoManager] Error undoing field:', error);
      return false;
    }
  }

  /**
   * Undo all field changes
   */
  undoAll(): number {
    let undoneCount = 0;

    for (const entry of this.history.values()) {
      try {
        const success = setFieldValue(entry.field.element, entry.originalValue, entry.field.type);
        if (success) {
          fireFieldEvents(entry.field.element);
          undoneCount++;
        }
      } catch (error) {
        console.error('[UndoManager] Error undoing field:', error);
      }
    }

    // Clear history
    this.history.clear();

    console.log('[UndoManager] Undone all fields:', undoneCount);
    return undoneCount;
  }

  /**
   * Get undo entry for a field
   */
  getEntry(element: HTMLElement): UndoEntry | undefined {
    return this.history.get(element);
  }

  /**
   * Check if field has undo history
   */
  hasUndo(element: HTMLElement): boolean {
    return this.history.has(element);
  }

  /**
   * Get count of undoable fields
   */
  getUndoCount(): number {
    return this.history.size;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history.clear();
  }

  /**
   * Get all entries (for debugging)
   */
  getAllEntries(): UndoEntry[] {
    return Array.from(this.history.values());
  }
}

/**
 * Fire DOM events to trigger ATS form validation
 * Must fire in correct order: focus -> input -> change -> blur
 */
function fireFieldEvents(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): void {
  // Focus event (if element not already focused)
  if (document.activeElement !== element) {
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
  }

  // Input event (fired during typing)
  element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
  );

  // Change event (fired when value changes)
  element.dispatchEvent(
    new Event('change', {
      bubbles: true,
      cancelable: true,
    })
  );

  // Blur event (field loses focus)
  element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

  // Also fire React synthetic events if present
  const reactKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
  if (reactKey) {
    // Trigger React re-render by directly calling onChange if present
    const reactProps = (element as any)[reactKey];
    if (reactProps?.onChange) {
      reactProps.onChange({ target: element, currentTarget: element });
    }
  }
}
