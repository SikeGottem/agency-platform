import type { AuditScore, MobileUXIssue } from './types';

/**
 * Analyzes touch target sizes
 */
export function analyzeTouchTargets(): MobileUXIssue[] {
  const issues: MobileUXIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, select, [onclick], [role="button"]'
    );
    
    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // 44px minimum touch target size
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push({
          type: 'touch-targets',
          severity: 'high',
          element: element.tagName.toLowerCase(),
          description: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}px (below 44x44px minimum)`,
          recommendation: 'Increase touch target size to at least 44x44px with padding or min-width/height'
        });
      }
    });
  }
  
  return issues;
}

/**
 * Checks for responsive design issues
 */
export function analyzeResponsiveness(): MobileUXIssue[] {
  const issues: MobileUXIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta || !viewportMeta.getAttribute('content')?.includes('width=device-width')) {
      issues.push({
        type: 'responsive',
        severity: 'critical',
        description: 'Missing or incorrect viewport meta tag',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>'
      });
    }
    
    // Check for fixed-width elements that might cause horizontal scroll
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const width = styles.width;
      
      // Check for fixed pixel widths greater than common mobile viewport
      if (width && width.includes('px')) {
        const pixelWidth = parseInt(width);
        if (pixelWidth > 375) { // iPhone viewport width
          issues.push({
            type: 'responsive',
            severity: 'medium',
            element: element.tagName.toLowerCase(),
            description: `Element has fixed width of ${pixelWidth}px (may cause horizontal scroll on mobile)`,
            recommendation: 'Use responsive units (%, vw, rem) or max-width instead of fixed widths'
          });
        }
      }
    });
  }
  
  return issues;
}

/**
 * Checks for horizontal scroll issues
 */
export function analyzeHorizontalScroll(): MobileUXIssue[] {
  const issues: MobileUXIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check if page content exceeds viewport width
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    
    if (bodyWidth > viewportWidth) {
      issues.push({
        type: 'horizontal-scroll',
        severity: 'high',
        description: `Page content (${bodyWidth}px) exceeds viewport width (${viewportWidth}px)`,
        recommendation: 'Ensure all content fits within viewport width using responsive design'
      });
    }
    
    // Check for elements that extend beyond viewport
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.right > viewportWidth) {
        issues.push({
          type: 'horizontal-scroll',
          severity: 'medium',
          element: element.tagName.toLowerCase(),
          description: `Element extends beyond right edge of viewport`,
          recommendation: 'Use responsive layout or overflow handling to prevent horizontal scroll'
        });
      }
    });
  }
  
  return issues;
}

/**
 * Analyzes font sizes for mobile readability
 */
export function analyzeFontSizes(): MobileUXIssue[] {
  const issues: MobileUXIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const textElements = document.querySelectorAll('p, span, div, a, button, input, textarea, li, td, th, h1, h2, h3, h4, h5, h6');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const fontSize = parseFloat(styles.fontSize);
      
      // Check if font size is below 16px (minimum for mobile)
      if (fontSize < 16 && element.textContent?.trim()) {
        issues.push({
          type: 'font-size',
          severity: 'medium',
          element: element.tagName.toLowerCase(),
          description: `Text size is ${fontSize}px (below 16px minimum for mobile readability)`,
          recommendation: 'Increase font size to at least 16px for body text on mobile devices'
        });
      }
    });
  }
  
  return issues;
}

/**
 * Checks mobile-specific interaction patterns
 */
export function analyzeMobileInteractions(): MobileUXIssue[] {
  const issues: MobileUXIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for hover-only interactions that don't work on mobile
    const elementsWithHover = document.querySelectorAll('[class*="hover"], [style*="hover"]');
    
    elementsWithHover.forEach((element) => {
      // This is a simplified check - in reality we'd analyze CSS for :hover-only interactions
      issues.push({
        type: 'responsive',
        severity: 'low',
        element: element.tagName.toLowerCase(),
        description: 'Element may rely on hover interactions not available on mobile',
        recommendation: 'Ensure interactive elements work with touch and provide touch-friendly alternatives'
      });
    });
    
    // Check for elements that might be too close together
    const clickableElements = document.querySelectorAll('a, button, input[type="submit"], input[type="button"]');
    
    for (let i = 0; i < clickableElements.length - 1; i++) {
      const current = clickableElements[i].getBoundingClientRect();
      const next = clickableElements[i + 1].getBoundingClientRect();
      
      const distance = Math.abs(current.bottom - next.top);
      
      if (distance < 8) { // Less than 8px spacing
        issues.push({
          type: 'touch-targets',
          severity: 'medium',
          description: `Clickable elements are too close together (${Math.round(distance)}px spacing)`,
          recommendation: 'Add more spacing between interactive elements to prevent accidental taps'
        });
        break; // Only report once per page to avoid spam
      }
    }
  }
  
  return issues;
}

/**
 * Runs a comprehensive mobile UX audit
 */
export function auditMobileUX(): AuditScore {
  const issues: MobileUXIssue[] = [];
  const recommendations: string[] = [];
  
  // Collect all mobile UX issues
  issues.push(...analyzeTouchTargets());
  issues.push(...analyzeResponsiveness());
  issues.push(...analyzeHorizontalScroll());
  issues.push(...analyzeFontSizes());
  issues.push(...analyzeMobileInteractions());
  
  // Calculate score based on issues
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  let score = 10;
  score -= criticalIssues * 3;
  score -= highIssues * 2;
  score -= mediumIssues * 1;
  score -= lowIssues * 0.5;
  
  score = Math.max(1, Math.min(10, score));
  
  // Generate recommendations
  if (criticalIssues > 0) {
    recommendations.push('Fix critical mobile UX issues immediately');
  }
  recommendations.push('Test on real mobile devices across different screen sizes');
  recommendations.push('Ensure all touch targets are at least 44x44px');
  recommendations.push('Verify no horizontal scrolling occurs on mobile viewports');
  recommendations.push('Use minimum 16px font size for body text');
  recommendations.push('Test navigation and interactions with touch input');
  
  return {
    score: Math.round(score * 10) / 10,
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
}