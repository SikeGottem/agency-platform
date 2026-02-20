import type { AuditScore, AccessibilityIssue } from './types';

/**
 * Analyzes color contrast ratios
 */
export function analyzeColorContrast(element?: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // This is a placeholder for axe-core integration
  // When axe-core is available, this will perform actual contrast analysis
  if (typeof window !== 'undefined' && element) {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Simplified contrast check (would use axe-core in reality)
    if (color && backgroundColor && color === backgroundColor) {
      issues.push({
        type: 'contrast',
        severity: 'critical',
        element: element.tagName.toLowerCase(),
        description: 'Text and background have the same color',
        recommendation: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)'
      });
    }
  }
  
  return issues;
}

/**
 * Checks for proper ARIA attributes
 */
export function analyzeARIA(element?: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  if (typeof window !== 'undefined' && element) {
    // Check for missing alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push({
        type: 'alt-text',
        severity: 'high',
        element: 'img',
        description: 'Image missing alt attribute',
        recommendation: 'Add descriptive alt text or alt="" for decorative images'
      });
    }
    
    // Check for interactive elements without proper ARIA labels
    const interactiveElements = ['BUTTON', 'A', 'INPUT'];
    if (interactiveElements.includes(element.tagName)) {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      element.textContent?.trim();
      
      if (!hasLabel) {
        issues.push({
          type: 'aria',
          severity: 'high',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element lacks accessible name',
          recommendation: 'Add aria-label, aria-labelledby, or visible text content'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Checks keyboard navigation capabilities
 */
export function analyzeKeyboardNavigation(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for focusable elements without visible focus indicators
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const outline = styles.getPropertyValue('outline') || styles.outline;
      const boxShadow = styles.getPropertyValue('box-shadow') || styles.boxShadow;
      const border = styles.getPropertyValue('border') || styles.border;
      
      const hasFocusStyle = (outline && outline !== 'none' && outline !== '0px none') ||
                           (boxShadow && boxShadow !== 'none') ||
                           (border && border !== 'none');
      
      if (!hasFocusStyle) {
        issues.push({
          type: 'focus-indicators',
          severity: 'medium',
          element: element.tagName.toLowerCase(),
          description: 'Focusable element lacks visible focus indicator',
          recommendation: 'Add focus styles with outline, box-shadow, or border changes'
        });
      }
    });
  }
  
  return issues;
}

/**
 * Runs a comprehensive accessibility audit
 */
export function auditAccessibility(targetElement?: HTMLElement): AuditScore {
  const issues: AccessibilityIssue[] = [];
  const recommendations: string[] = [];
  
  // Collect all accessibility issues
  issues.push(...analyzeColorContrast(targetElement));
  issues.push(...analyzeARIA(targetElement));
  issues.push(...analyzeKeyboardNavigation());
  
  // Generate recommendations based on issues
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  // Calculate score (1-10) based on issue severity
  let score = 10;
  score -= criticalIssues * 3; // Critical issues cost 3 points each
  score -= highIssues * 2;     // High issues cost 2 points each
  score -= mediumIssues * 1;   // Medium issues cost 1 point each
  score -= lowIssues * 0.5;    // Low issues cost 0.5 points each
  
  score = Math.max(1, Math.min(10, score)); // Clamp between 1-10
  
  // Generate general recommendations
  if (criticalIssues > 0) {
    recommendations.push('Address critical accessibility issues immediately');
  }
  if (highIssues > 0) {
    recommendations.push('Fix high-priority accessibility barriers');
  }
  recommendations.push('Run automated accessibility testing with axe-core');
  recommendations.push('Conduct manual keyboard navigation testing');
  recommendations.push('Test with screen readers');
  
  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal place
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
}