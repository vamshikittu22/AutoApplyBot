import { detectATS } from './detector';
import type { DetectionResult } from '@/types/ats';

/**
 * MutationObserver wrapper for detecting dynamically loaded forms
 * Scoped to form containers only to minimize performance impact
 */
export class FormObserver {
  private observer: MutationObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastDetection: DetectionResult | null = null;
  private onDetectionChange: ((result: DetectionResult) => void) | null = null;

  /**
   * Start observing for form changes
   * @param root - Root element to observe (defaults to document.body)
   * @param callback - Called when detection result changes
   */
  start(root: HTMLElement = document.body, callback?: (result: DetectionResult) => void): void {
    if (this.observer) {
      console.warn('[FormObserver] Already observing, disconnecting first');
      this.stop();
    }

    this.onDetectionChange = callback ?? null;

    // Create observer
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // Observe with focused config (forms and inputs only)
    this.observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-automation-id', 'data-qa', 'data-lever', 'class', 'id'],
    });

    console.log('[FormObserver] Started observing for form changes');

    // Run initial detection
    this.triggerDetection();
  }

  /**
   * Stop observing
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log('[FormObserver] Stopped observing');
  }

  /**
   * Handle mutations with debouncing
   */
  private handleMutations(mutations: MutationRecord[]): void {
    // Check if mutations are relevant (form-related)
    const isRelevant = mutations.some((mutation) => {
      if (mutation.type === 'childList') {
        // Check if added nodes contain forms or form elements
        const addedNodes = Array.from(mutation.addedNodes);
        return addedNodes.some((node) => {
          if (node instanceof Element) {
            return (
              node.matches('form, input, select, textarea') ||
              node.querySelector('form, input, select, textarea') !== null
            );
          }
          return false;
        });
      }

      if (mutation.type === 'attributes') {
        // Check if attribute change is on form-related element
        const target = mutation.target as Element;
        return target.matches('form, input, select, textarea, [role="form"]');
      }

      return false;
    });

    if (isRelevant) {
      this.triggerDetection();
    }
  }

  /**
   * Trigger detection with debouncing (300ms)
   */
  private triggerDetection(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.runDetection();
    }, 300);
  }

  /**
   * Run detection and notify if result changed
   */
  private async runDetection(): Promise<void> {
    try {
      const result = await detectATS(window.location.href, document);

      // Check if detection result changed
      if (this.hasDetectionChanged(result)) {
        console.log('[FormObserver] Detection result changed:', result);
        this.lastDetection = result;

        if (this.onDetectionChange) {
          this.onDetectionChange(result);
        }
      }
    } catch (error) {
      console.error('[FormObserver] Detection failed:', error);
    }
  }

  /**
   * Check if detection result changed significantly
   */
  private hasDetectionChanged(newResult: DetectionResult): boolean {
    if (!this.lastDetection) return true;

    return (
      newResult.platform !== this.lastDetection.platform ||
      Math.abs(newResult.confidence - this.lastDetection.confidence) > 10
    );
  }

  /**
   * Get last detection result
   */
  getLastDetection(): DetectionResult | null {
    return this.lastDetection;
  }
}

/**
 * Create and start form observer
 */
export function createFormObserver(callback?: (result: DetectionResult) => void): FormObserver {
  const observer = new FormObserver();
  observer.start(document.body, callback);
  return observer;
}
