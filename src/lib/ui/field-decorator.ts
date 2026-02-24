import type { FieldMapping } from '@/types/autofill';

/**
 * Field decoration data
 */
interface FieldDecoration {
  element: HTMLElement;
  indicator: HTMLElement;
  undoButton: HTMLElement | null;
  originalBorder: string;
  originalOutline: string;
}

/**
 * Store of decorated fields
 */
const decoratedFields = new Map<HTMLElement, FieldDecoration>();

/**
 * Decorate a filled field with visual indicators
 * Green border = high confidence (≥80%)
 * Yellow border = medium confidence (70-79%)
 * Red border = low confidence (<70%)
 */
export function decorateField(mapping: FieldMapping, onUndo?: () => void): void {
  const { field, confidence, shouldFill } = mapping;
  const element = field.element;

  // Don't decorate if already decorated
  if (decoratedFields.has(element)) {
    return;
  }

  // Store original styles
  const originalBorder = element.style.border;
  const originalOutline = element.style.outline;

  // Determine color based on confidence
  const color = getConfidenceColor(confidence);
  const borderColor = COLOR_MAP[color];

  // Apply border
  element.style.border = `2px solid ${borderColor}`;
  element.style.outline = 'none';
  element.style.transition = 'border-color 0.3s ease';

  // Create confidence indicator badge
  const indicator = createIndicatorBadge(confidence, color);
  positionIndicator(element, indicator);

  // Create undo button if filled
  let undoButton: HTMLElement | null = null;
  if (shouldFill && onUndo) {
    undoButton = createUndoButton(onUndo);
    positionUndoButton(element, undoButton);
  }

  // Store decoration data
  decoratedFields.set(element, {
    element,
    indicator,
    undoButton,
    originalBorder,
    originalOutline,
  });

  // Add to DOM
  document.body.appendChild(indicator);
  if (undoButton) {
    document.body.appendChild(undoButton);
  }

  // Update position on scroll/resize
  const updatePosition = () => {
    positionIndicator(element, indicator);
    if (undoButton) {
      positionUndoButton(element, undoButton);
    }
  };

  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition, { passive: true });
}

/**
 * Clear decoration from a field
 */
export function clearDecoration(element: HTMLElement): void {
  const decoration = decoratedFields.get(element);
  if (!decoration) return;

  // Restore original styles
  element.style.border = decoration.originalBorder;
  element.style.outline = decoration.originalOutline;

  // Remove indicator and undo button
  decoration.indicator.remove();
  decoration.undoButton?.remove();

  decoratedFields.delete(element);
}

/**
 * Clear all decorations
 */
export function clearAllDecorations(): void {
  for (const [element] of decoratedFields) {
    clearDecoration(element);
  }
}

/**
 * Get confidence color category
 */
function getConfidenceColor(confidence: number): 'green' | 'yellow' | 'red' {
  if (confidence >= 80) return 'green';
  if (confidence >= 70) return 'yellow';
  return 'red';
}

const COLOR_MAP = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
};

/**
 * Create confidence indicator badge
 */
function createIndicatorBadge(confidence: number, color: 'green' | 'yellow' | 'red'): HTMLElement {
  const badge = document.createElement('div');
  badge.className = 'autoapply-field-indicator';
  badge.style.cssText = `
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${COLOR_MAP[color]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    z-index: 10000;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;

  const icon = confidence >= 80 ? '✓' : confidence >= 70 ? '!' : '?';
  badge.textContent = icon;
  badge.title = `Confidence: ${confidence}%`;

  return badge;
}

/**
 * Create undo button
 */
function createUndoButton(onUndo: () => void): HTMLElement {
  const button = document.createElement('button');
  button.className = 'autoapply-undo-button';
  button.textContent = '↶';
  button.title = 'Undo';
  button.style.cssText = `
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #6366f1;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
    z-index: 10001;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: background 0.2s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = '#4f46e5';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#6366f1';
  });

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUndo();
  });

  return button;
}

/**
 * Position indicator badge relative to field
 */
function positionIndicator(field: HTMLElement, indicator: HTMLElement): void {
  const rect = field.getBoundingClientRect();
  indicator.style.top = `${rect.top + window.scrollY - 10}px`;
  indicator.style.left = `${rect.left + window.scrollX - 10}px`;
}

/**
 * Position undo button relative to field
 */
function positionUndoButton(field: HTMLElement, button: HTMLElement): void {
  const rect = field.getBoundingClientRect();
  button.style.top = `${rect.top + window.scrollY - 10}px`;
  button.style.left = `${rect.right + window.scrollX - 14}px`;
}

/**
 * Get all decorated fields
 */
export function getDecoratedFields(): HTMLElement[] {
  return Array.from(decoratedFields.keys());
}
