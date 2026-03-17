// Accessibility utilities and helpers

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Keyboard navigation helpers
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect: (index: number) => void
) {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      newIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect(currentIndex);
      return;
    default:
      return;
  }

  items[newIndex]?.focus();
  onSelect(newIndex);
}

// Skip to main content
export function addSkipLink() {
  if (typeof document === 'undefined') return;
  
  // Check if skip link already exists
  if (document.querySelector('a[href="#main-content"]')) return;
  
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg';
  
  if (document.body) {
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

// ARIA label helpers
export function setAriaLabel(element: HTMLElement, label: string) {
  element.setAttribute('aria-label', label);
}

export function setAriaDescribedBy(element: HTMLElement, id: string) {
  element.setAttribute('aria-describedby', id);
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean) {
  element.setAttribute('aria-expanded', String(expanded));
}

export function setAriaSelected(element: HTMLElement, selected: boolean) {
  element.setAttribute('aria-selected', String(selected));
}

export function setAriaPressed(element: HTMLElement, pressed: boolean) {
  element.setAttribute('aria-pressed', String(pressed));
}

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): number {
  const getLuminance = (color: string) => {
    // Simple RGB to luminance calculation
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Check if element is visible
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    parseFloat(style.opacity) > 0
  );
}

// Auto-scroll to error
export function scrollToError(errorElement: HTMLElement) {
  errorElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  
  // Focus the error element or first focusable child
  const focusable = errorElement.querySelector('input, button, select, textarea') as HTMLElement;
  if (focusable) {
    focusable.focus();
  } else {
    errorElement.focus();
  }
  
  announceToScreenReader('Please fix the error and try again', 'assertive');
}

// Ensure minimum touch target size (44x44px for mobile)
export function checkTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // pixels
  
  return rect.width >= minSize && rect.height >= minSize;
}

// Add visual focus indicators
export function enhanceFocusVisibility() {
  const style = document.createElement('style');
  style.textContent = `
    *:focus-visible {
      outline: 3px solid #22c55e !important;
      outline-offset: 2px !important;
    }
    
    button:focus-visible,
    a:focus-visible,
    [role="button"]:focus-visible {
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
}

// Reduce motion for users who prefer reduced motion
export function respectReducedMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    const style = document.createElement('style');
    style.textContent = `
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  return prefersReducedMotion;
}

// Screen reader only class
export function addScreenReaderOnlyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    .sr-only-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;
  document.head.appendChild(style);
}

// High contrast mode detection
export function detectHighContrastMode(): boolean {
  // Create a test element
  const testElement = document.createElement('div');
  testElement.style.borderColor = 'rgb(0, 255, 0)';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  const computedColor = window.getComputedStyle(testElement).borderColor;
  document.body.removeChild(testElement);
  
  // In high contrast mode, colors are adjusted
  return computedColor !== 'rgb(0, 255, 0)';
}

// Initialize all accessibility features
export function initAccessibility() {
  try {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initAccessibilityFeatures();
      });
    } else {
      initAccessibilityFeatures();
    }
  } catch (error) {
    console.warn('Accessibility initialization failed:', error);
  }
}

function initAccessibilityFeatures() {
  try {
    addSkipLink();
    addScreenReaderOnlyStyles();
    enhanceFocusVisibility();
    respectReducedMotion();
    
    // Log accessibility mode
    if (detectHighContrastMode()) {
      console.log('High contrast mode detected');
    }
  } catch (error) {
    console.warn('Some accessibility features failed to initialize:', error);
  }
}

// Validate form accessibility
export function validateFormAccessibility(form: HTMLFormElement): string[] {
  const errors: string[] = [];
  
  // Check all inputs have labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = form.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        errors.push(`Input with id "${id}" is missing a label`);
      }
    } else {
      errors.push('Input is missing an id attribute');
    }
  });
  
  // Check required fields have aria-required
  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach((input) => {
    if (!input.getAttribute('aria-required')) {
      input.setAttribute('aria-required', 'true');
    }
  });
  
  return errors;
}