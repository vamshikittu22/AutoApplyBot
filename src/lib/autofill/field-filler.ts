import type { DetectedField, FieldType } from '@/types/autofill';

/**
 * Fill a form field with a value
 * Fires proper DOM events so ATS forms recognize the change
 *
 * @param field - Detected form field
 * @param value - Value to fill
 * @returns Success boolean
 */
export function fillField(field: DetectedField, value: string): boolean {
  try {
    const element = field.element;

    // Validate value before filling
    if (!validateValue(field, value)) {
      console.warn('[FieldFiller] Invalid value for field:', field.label, value);
      return false;
    }

    // Set value based on field type
    const success = setFieldValue(element, value, field.type);
    if (!success) return false;

    // Fire events to trigger ATS validation
    fireFieldEvents(element);

    console.log('[FieldFiller] Filled field:', field.label, value);
    return true;
  } catch (error) {
    console.error('[FieldFiller] Error filling field:', error);
    return false;
  }
}

/**
 * Get current field value
 */
export function getFieldValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string {
  if (element instanceof HTMLSelectElement) {
    return element.value;
  }

  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') {
      return element.checked ? 'true' : 'false';
    }
    if (element.type === 'radio') {
      return element.checked ? element.value : '';
    }
  }

  return element.value;
}

/**
 * Set field value with proper handling for different field types
 */
export function setFieldValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
  type: FieldType
): boolean {
  try {
    if (element instanceof HTMLSelectElement) {
      return setSelectValue(element, value);
    }

    if (element instanceof HTMLInputElement) {
      return setInputValue(element, value, type);
    }

    if (element instanceof HTMLTextAreaElement) {
      return setTextareaValue(element, value);
    }

    return false;
  } catch (error) {
    console.error('[FieldFiller] Error setting value:', error);
    return false;
  }
}

/**
 * Set input field value
 */
function setInputValue(element: HTMLInputElement, value: string, type: FieldType): boolean {
  switch (type) {
    case 'checkbox':
      element.checked = value === 'true' || value === '1';
      return true;

    case 'radio':
      if (element.value === value) {
        element.checked = true;
        return true;
      }
      return false;

    case 'file':
      // Cannot programmatically set file inputs
      console.warn('[FieldFiller] Cannot autofill file input');
      return false;

    default:
      // For React/Vue compatibility, set both value and native value
      setNativeValue(element, value);
      return true;
  }
}

/**
 * Set select field value
 */
function setSelectValue(element: HTMLSelectElement, value: string): boolean {
  // Try exact match first
  const exactOption = Array.from(element.options).find(
    (opt) => opt.value === value || opt.textContent?.trim() === value
  );

  if (exactOption) {
    element.value = exactOption.value;
    return true;
  }

  // Try fuzzy match (case-insensitive)
  const fuzzyOption = Array.from(element.options).find(
    (opt) =>
      opt.value.toLowerCase().includes(value.toLowerCase()) ||
      opt.textContent?.toLowerCase().includes(value.toLowerCase())
  );

  if (fuzzyOption) {
    element.value = fuzzyOption.value;
    return true;
  }

  console.warn('[FieldFiller] No matching option found in select:', value);
  return false;
}

/**
 * Set textarea value
 */
function setTextareaValue(element: HTMLTextAreaElement, value: string): boolean {
  setNativeValue(element, value);
  return true;
}

/**
 * Set native value for React/Vue compatibility
 * React uses a setter on the prototype to track changes
 */
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;

  if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
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

/**
 * Validate value before filling
 */
function validateValue(field: DetectedField, value: string): boolean {
  // Empty value check
  if (!value || value.trim() === '') {
    return false;
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      return isValidEmail(value);

    case 'phone':
      return isValidPhone(value);

    case 'url':
      return isValidURL(value);

    case 'date':
      return isValidDate(value);

    default:
      return true;
  }
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation (basic)
 */
function isValidPhone(phone: string): boolean {
  // Accept various formats: 555-1234, (555) 123-4567, +1 555 123 4567
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

/**
 * URL validation
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Date validation
 */
function isValidDate(date: string): boolean {
  // Accept YYYY-MM-DD or MM/DD/YYYY or other formats
  const parsed = Date.parse(date);
  return !isNaN(parsed);
}

/**
 * Clear field value
 */
export function clearField(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): void {
  if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    element.checked = false;
  } else {
    setFieldValue(element, '', 'text');
  }
  fireFieldEvents(element);
}
