import type { Profile } from '@/types/profile';
import type { FieldMapping } from '@/types/autofill';
import type { ATSType } from '@/types/ats';
import { mapFieldsToProfile } from './field-mapper';
import { fillField, getFieldValue } from './field-filler';
import { UndoManager } from './undo-manager';
import { CONFIDENCE_THRESHOLDS } from '@/constants/field-selectors';

/**
 * Autofill result
 */
export interface AutofillResult {
  success: boolean;
  filledCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ field: string; error: string }>;
  undoManager: UndoManager;
}

/**
 * Autofill options
 */
export interface AutofillOptions {
  /** Only fill fields with confidence >= this threshold (default: 70) */
  minConfidence?: number;
  /** Container element to search for fields (default: document) */
  container?: HTMLElement | Document;
  /** Callback for progress updates */
  onProgress?: (current: number, total: number, fieldName: string) => void;
  /** Callback for field filled */
  onFieldFilled?: (mapping: FieldMapping) => void;
  /** Callback for field skipped */
  onFieldSkipped?: (mapping: FieldMapping, reason: string) => void;
}

/**
 * Main autofill engine class
 */
export class AutofillEngine {
  private undoManager: UndoManager;
  private profile: Profile | null = null;
  private atsType: ATSType | null = null;

  constructor() {
    this.undoManager = new UndoManager();
  }

  /**
   * Set user profile
   */
  setProfile(profile: Profile): void {
    this.profile = profile;
  }

  /**
   * Set ATS type
   */
  setATSType(atsType: ATSType): void {
    this.atsType = atsType;
  }

  /**
   * Get current ATS type
   */
  getATSType(): ATSType | null {
    return this.atsType;
  }

  /**
   * Run autofill on current form
   */
  async autofill(options: AutofillOptions = {}): Promise<AutofillResult> {
    if (!this.profile) {
      throw new Error('Profile not set. Call setProfile() first.');
    }

    const {
      minConfidence = CONFIDENCE_THRESHOLDS.MEDIUM,
      container = document,
      onProgress,
      onFieldFilled,
      onFieldSkipped,
    } = options;

    console.log('[AutofillEngine] Starting autofill...');

    // Map fields to profile
    const mappingResult = mapFieldsToProfile(this.profile, container);
    console.log('[AutofillEngine] Mapped fields:', mappingResult);

    // Filter mappings to fill (confidence >= threshold, has value)
    const fillableMappings = mappingResult.mappings.filter(
      (m) => m.shouldFill && m.confidence >= minConfidence
    );

    console.log('[AutofillEngine] Fillable fields:', fillableMappings.length);

    const result: AutofillResult = {
      success: true,
      filledCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      undoManager: this.undoManager,
    };

    // Fill each field
    for (let i = 0; i < fillableMappings.length; i++) {
      const mapping = fillableMappings[i];
      if (!mapping) continue; // Safety check
      if (!mapping.value) continue; // Skip if no value

      // Progress callback
      if (onProgress) {
        onProgress(i + 1, fillableMappings.length, mapping.field.label || 'Unknown field');
      }

      try {
        // Get original value for undo
        const originalValue = getFieldValue(mapping.field.element);

        // Fill field
        const success = fillField(mapping.field, mapping.value);

        if (success) {
          // Record for undo
          this.undoManager.record(mapping.field, originalValue, mapping.value);

          result.filledCount++;

          if (onFieldFilled) {
            onFieldFilled(mapping);
          }
        } else {
          result.skippedCount++;

          if (onFieldSkipped) {
            onFieldSkipped(mapping, 'Fill failed');
          }
        }
      } catch (error) {
        result.errorCount++;
        result.errors.push({
          field: mapping.field.label || 'Unknown',
          error: error instanceof Error ? error.message : String(error),
        });

        if (onFieldSkipped) {
          onFieldSkipped(mapping, 'Error occurred');
        }
      }
    }

    console.log('[AutofillEngine] Autofill complete:', result);
    return result;
  }

  /**
   * Undo a single field
   */
  undoField(element: HTMLElement): boolean {
    return this.undoManager.undoField(element);
  }

  /**
   * Undo all filled fields
   */
  undoAll(): number {
    return this.undoManager.undoAll();
  }

  /**
   * Get undo manager
   */
  getUndoManager(): UndoManager {
    return this.undoManager;
  }

  /**
   * Check if field can be undone
   */
  canUndo(element: HTMLElement): boolean {
    return this.undoManager.hasUndo(element);
  }

  /**
   * Get count of undoable fields
   */
  getUndoCount(): number {
    return this.undoManager.getUndoCount();
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.undoManager.clear();
    this.profile = null;
    this.atsType = null;
  }
}

/**
 * Convenience function for one-shot autofill
 */
export async function autofillForm(
  profile: Profile,
  options: AutofillOptions = {}
): Promise<AutofillResult> {
  const engine = new AutofillEngine();
  engine.setProfile(profile);
  return engine.autofill(options);
}
