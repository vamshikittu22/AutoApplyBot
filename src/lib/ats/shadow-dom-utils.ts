/**
 * Shadow DOM traversal utilities for ATS detection
 * Required for Workday which uses Shadow DOM extensively
 */

/**
 * Recursively find all shadow roots in the document
 */
export function getAllShadowRoots(root: Document | ShadowRoot = document): ShadowRoot[] {
  const shadowRoots: ShadowRoot[] = [];

  // Find all elements with shadow roots
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_ELEMENT, null);

  let node: Node | null = walker.currentNode;
  while (node) {
    if (node instanceof Element && node.shadowRoot) {
      shadowRoots.push(node.shadowRoot);
      // Recursively find shadow roots inside this shadow root
      shadowRoots.push(...getAllShadowRoots(node.shadowRoot));
    }
    node = walker.nextNode();
  }

  return shadowRoots;
}

/**
 * Query selector that searches through Shadow DOM boundaries
 * Similar to querySelectorAll but works with Shadow DOM
 */
export function querySelectorDeep(
  selector: string,
  root: Document | Element | ShadowRoot = document
): Element[] {
  const results: Element[] = [];

  // Search in current context
  const elements = root.querySelectorAll(selector);
  results.push(...Array.from(elements));

  // Search in shadow roots
  const shadowRoots = getAllShadowRoots(root as Document);
  for (const shadowRoot of shadowRoots) {
    const shadowElements = shadowRoot.querySelectorAll(selector);
    results.push(...Array.from(shadowElements));
  }

  return results;
}

/**
 * Traverse Shadow DOM tree and apply callback to each element
 */
export function traverseShadowDOM(
  callback: (element: Element) => void,
  root: Document | Element | ShadowRoot = document
): void {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_ELEMENT, null);

  let node: Node | null = walker.currentNode;
  while (node) {
    if (node instanceof Element) {
      callback(node);

      // Traverse shadow root if present
      if (node.shadowRoot) {
        traverseShadowDOM(callback, node.shadowRoot);
      }
    }
    node = walker.nextNode();
  }
}

/**
 * Find element in Shadow DOM by attribute
 */
export function findByAttributeDeep(
  attribute: string,
  value?: string,
  root: Document | Element | ShadowRoot = document
): Element | null {
  // Try regular query first
  const selector = value ? `[${attribute}="${value}"]` : `[${attribute}]`;
  const element = root.querySelector(selector);
  if (element) return element;

  // Search in shadow roots
  const shadowRoots = getAllShadowRoots(root as Document);
  for (const shadowRoot of shadowRoots) {
    const shadowElement = shadowRoot.querySelector(selector);
    if (shadowElement) return shadowElement;
  }

  return null;
}

/**
 * Check if element is inside Shadow DOM
 */
export function isInShadowDOM(element: Element): boolean {
  let parent = element.parentNode;
  while (parent) {
    if (parent instanceof ShadowRoot) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

/**
 * Get the closest shadow host element
 */
export function getShadowHost(element: Element): Element | null {
  let parent = element.parentNode;
  while (parent) {
    if (parent instanceof ShadowRoot) {
      return parent.host;
    }
    parent = parent.parentNode;
  }
  return null;
}
