/**
 * Button position mode
 */
export type PositionMode = 'inline' | 'fixed';

/**
 * Position configuration
 */
export interface PositionConfig {
  mode: PositionMode;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

/**
 * Hybrid button positioner
 * Starts inline, switches to fixed on scroll
 */
export class ButtonPositioner {
  private buttonElement: HTMLElement;
  private formContainer: HTMLElement;
  private mode: PositionMode = 'inline';
  private inlinePosition: DOMRect | null = null;
  private onModeChange?: (mode: PositionMode) => void;

  constructor(
    buttonElement: HTMLElement,
    formContainer: HTMLElement,
    onModeChange?: (mode: PositionMode) => void
  ) {
    this.buttonElement = buttonElement;
    this.formContainer = formContainer;
    this.onModeChange = onModeChange;

    this.init();
  }

  /**
   * Initialize positioning
   */
  private init(): void {
    // Start in inline mode
    this.setInlineMode();

    // Store initial position
    this.inlinePosition = this.buttonElement.getBoundingClientRect();

    // Listen for scroll/resize
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  /**
   * Handle scroll event
   */
  private handleScroll = (): void => {
    if (!this.inlinePosition) return;

    const formRect = this.formContainer.getBoundingClientRect();

    // Switch to fixed if form is scrolled out of top viewport
    if (formRect.top < 0 && formRect.bottom > 100) {
      if (this.mode !== 'fixed') {
        this.setFixedMode();
      }
    } else {
      // Switch back to inline when form in view
      if (this.mode !== 'inline') {
        this.setInlineMode();
      }
    }
  };

  /**
   * Handle resize event
   */
  private handleResize = (): void => {
    // Update inline position
    if (this.mode === 'inline') {
      this.inlinePosition = this.buttonElement.getBoundingClientRect();
    }
  };

  /**
   * Set inline mode
   */
  private setInlineMode(): void {
    this.buttonElement.style.position = 'static';
    this.buttonElement.style.top = '';
    this.buttonElement.style.left = '';
    this.buttonElement.style.right = '';
    this.buttonElement.style.bottom = '';

    this.mode = 'inline';
    this.onModeChange?.('inline');
  }

  /**
   * Set fixed mode (top-right corner)
   */
  private setFixedMode(): void {
    this.buttonElement.style.position = 'fixed';
    this.buttonElement.style.top = '16px';
    this.buttonElement.style.right = '16px';
    this.buttonElement.style.left = '';
    this.buttonElement.style.bottom = '';
    this.buttonElement.style.zIndex = '10000';

    this.mode = 'fixed';
    this.onModeChange?.('fixed');
  }

  /**
   * Get current mode
   */
  getMode(): PositionMode {
    return this.mode;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}
