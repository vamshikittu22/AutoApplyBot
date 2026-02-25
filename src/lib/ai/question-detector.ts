import type { ATSType } from '@/types/ats';

export interface QuestionField {
  element: HTMLTextAreaElement | HTMLInputElement;
  label: string;
  confidence: number;
  isEssay: boolean;
  detectionSignals: string[];
}

export interface DetectionConfig {
  minCharLimit: number; // 500 for essay detection
  minConfidence: number; // 0.7 to show button
  questionKeywords: string[];
  essayKeywords: string[];
}

const DEFAULT_CONFIG: DetectionConfig = {
  minCharLimit: 500,
  minConfidence: 0.7,
  questionKeywords: [
    'why',
    'how',
    'what',
    'describe',
    'explain',
    'tell us',
    'share',
    'give an example',
    'experience',
    'challenge',
    'strength',
    'weakness',
    'motivated',
    'interest',
    'passion',
  ],
  essayKeywords: [
    'describe a time',
    'tell us about',
    'give an example',
    'share a story',
    'explain how',
    'walk us through',
  ],
};

/**
 * Detect question fields on the page
 */
export function detectQuestionFields(
  atsType: ATSType | null,
  config: DetectionConfig = DEFAULT_CONFIG
): QuestionField[] {
  const fields: QuestionField[] = [];

  // Find all textarea and text input fields
  const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'));
  const textInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="text"]'));

  const allFields: (HTMLTextAreaElement | HTMLInputElement)[] = [...textareas, ...textInputs];

  for (const element of allFields) {
    const detection = analyzeField(element, atsType, config);

    if (detection.confidence >= config.minConfidence) {
      fields.push(detection);
    }
  }

  return fields;
}

/**
 * Analyze a single field for question indicators
 */
function analyzeField(
  element: HTMLTextAreaElement | HTMLInputElement,
  atsType: ATSType | null,
  config: DetectionConfig
): QuestionField {
  const signals: string[] = [];
  let score = 0;

  // Signal 1: Field type (textarea more likely than input)
  if (element.tagName === 'TEXTAREA') {
    score += 0.3;
    signals.push('textarea');
  } else {
    score += 0.1;
    signals.push('text-input');
  }

  // Signal 2: Label analysis
  const label = getFieldLabel(element, atsType);
  const labelLower = label.toLowerCase();

  for (const keyword of config.questionKeywords) {
    if (labelLower.includes(keyword)) {
      score += 0.2;
      signals.push(`keyword:${keyword}`);
      break; // Only count once
    }
  }

  // Signal 3: Question mark in label
  if (label.includes('?')) {
    score += 0.2;
    signals.push('question-mark');
  }

  // Signal 4: Character limit (longer fields more likely)
  const maxLength = element.maxLength;
  if (maxLength > 0) {
    if (maxLength >= config.minCharLimit) {
      score += 0.2;
      signals.push('long-limit');
    } else if (maxLength >= 200) {
      score += 0.1;
      signals.push('medium-limit');
    }
  }

  // Signal 5: Placeholder text
  const placeholder = element.placeholder?.toLowerCase() || '';
  for (const keyword of config.questionKeywords) {
    if (placeholder.includes(keyword)) {
      score += 0.1;
      signals.push('placeholder-keyword');
      break;
    }
  }

  // Signal 6: Rows attribute (for textarea)
  if (element.tagName === 'TEXTAREA') {
    const rows = (element as HTMLTextAreaElement).rows;
    if (rows >= 5) {
      score += 0.1;
      signals.push('multi-row');
    }
  }

  // Determine if essay mode
  const isEssay = detectEssayMode(label, maxLength, config);

  return {
    element,
    label,
    confidence: Math.min(score, 1.0),
    isEssay,
    detectionSignals: signals,
  };
}

/**
 * Get field label using multiple strategies
 */
function getFieldLabel(
  element: HTMLTextAreaElement | HTMLInputElement,
  atsType: ATSType | null
): string {
  // Strategy 1: Explicit label element
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      return label.textContent?.trim() || '';
    }
  }

  // Strategy 2: Parent label
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.textContent?.trim() || '';
  }

  // Strategy 3: aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }

  // Strategy 4: aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) {
      return labelElement.textContent?.trim() || '';
    }
  }

  // Strategy 5: ATS-specific selectors
  if (atsType === 'workday') {
    // Workday often has labels as previous siblings
    const prevSibling = element.previousElementSibling;
    if (prevSibling?.tagName === 'LABEL') {
      return prevSibling.textContent?.trim() || '';
    }
  }

  // Strategy 6: Placeholder as fallback
  return element.placeholder || 'Untitled Field';
}

/**
 * Detect if field should use essay mode (STAR outline)
 */
function detectEssayMode(label: string, maxLength: number, config: DetectionConfig): boolean {
  const labelLower = label.toLowerCase();

  // Check for essay keywords
  for (const keyword of config.essayKeywords) {
    if (labelLower.includes(keyword)) {
      return true;
    }
  }

  // Check character limit
  if (maxLength >= config.minCharLimit) {
    return true;
  }

  return false;
}

/**
 * Watch for dynamically added fields
 */
export function watchForQuestionFields(
  callback: (fields: QuestionField[]) => void,
  atsType: ATSType | null
): MutationObserver {
  const observer = new MutationObserver(() => {
    const fields = detectQuestionFields(atsType);
    if (fields.length > 0) {
      callback(fields);
    }
  });

  // Observe form containers only
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    observer.observe(form, {
      childList: true,
      subtree: true,
    });
  });

  return observer;
}
