import type { DetectedField, FieldType } from '@/types/autofill';
import { querySelectorDeep } from '@/lib/ats/shadow-dom-utils';

/**
 * Detect all form fields on the page
 * Searches through Shadow DOM for Workday
 */
export function detectFormFields(container: HTMLElement | Document = document): DetectedField[] {
  const fields: DetectedField[] = [];

  // Find all input, select, and textarea elements (including Shadow DOM)
  const inputElements = querySelectorDeep(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    container
  );

  for (const element of inputElements) {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const field = createDetectedField(element);
      if (field) {
        fields.push(field);
      }
    }
  }

  return fields;
}

/**
 * Create DetectedField from form element
 */
function createDetectedField(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): DetectedField | null {
  // Skip invisible fields
  if (!isVisible(element)) return null;

  const label = findFieldLabel(element);
  const type = detectFieldType(element);

  return {
    element,
    type,
    label,
    placeholder: element.getAttribute('placeholder'),
    name: element.getAttribute('name'),
    id: element.id || null,
    ariaLabel: element.getAttribute('aria-label'),
    required: element.required || element.getAttribute('aria-required') === 'true',
    currentValue: 'value' in element ? element.value : '',
  };
}

/**
 * Detect field type from element
 */
export function detectFieldType(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): FieldType {
  if (element instanceof HTMLSelectElement) {
    return 'select';
  }

  if (element instanceof HTMLTextAreaElement) {
    return 'textarea';
  }

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();

    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'phone';
      case 'url':
        return 'url';
      case 'date':
        return 'date';
      case 'checkbox':
        return 'checkbox';
      case 'radio':
        return 'radio';
      case 'file':
        return 'file';
      case 'text':
      case 'search':
      default:
        // Infer type from name/id/label
        return inferFieldType(element);
    }
  }

  return 'unknown';
}

/**
 * Infer field type from element attributes
 */
function inferFieldType(element: HTMLInputElement): FieldType {
  const name = element.name?.toLowerCase() || '';
  const id = element.id?.toLowerCase() || '';
  const label = findFieldLabel(element)?.toLowerCase() || '';
  const combined = `${name} ${id} ${label}`;

  if (/email/.test(combined)) return 'email';
  if (/phone|tel|mobile|cell/.test(combined)) return 'phone';
  if (/url|link|website/.test(combined)) return 'url';
  if (/date|year/.test(combined)) return 'date';

  return 'text';
}

/**
 * Find label for form element
 * Checks <label>, aria-label, aria-labelledby, and parent text
 */
function findFieldLabel(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string | null {
  // Try <label> element
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label?.textContent) {
      return label.textContent.trim();
    }
  }

  // Try parent label
  const parentLabel = element.closest('label');
  if (parentLabel?.textContent) {
    return parentLabel.textContent.trim();
  }

  // Try aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement?.textContent) {
      return labelElement.textContent.trim();
    }
  }

  // Try aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }

  // Try placeholder as last resort
  const placeholder = element.getAttribute('placeholder');
  if (placeholder) {
    return placeholder.trim();
  }

  return null;
}

/**
 * Check if element is visible
 */
function isVisible(element: HTMLElement): boolean {
  // Check CSS visibility
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  // Check dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  return true;
}
