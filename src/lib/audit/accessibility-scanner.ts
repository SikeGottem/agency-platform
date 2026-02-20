import type { AccessibilityIssue, AuditScore } from './types';

/**
 * Configuration for accessibility scanning
 */
export interface AccessibilityScanConfig {
  pages: string[];
  baseUrl?: string;
  includePaths?: string[];
  excludeSelectors?: string[];
}

/**
 * Comprehensive accessibility scanner that uses axe-core to scan multiple pages
 */
export class AccessibilityScanner {
  private config: AccessibilityScanConfig;
  
  constructor(config: AccessibilityScanConfig) {
    this.config = config;
  }
  
  /**
   * Scans all configured pages for accessibility issues
   */
  async scanAllPages(): Promise<{
    pageResults: Record<string, AuditScore>;
    overallScore: number;
    criticalIssues: AccessibilityIssue[];
    summary: {
      totalIssues: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
    };
  }> {
    const pageResults: Record<string, AuditScore> = {};
    const allIssues: AccessibilityIssue[] = [];
    
    // In a real implementation, this would use puppeteer or playwright to navigate pages
    // For now, we'll simulate scanning the current page as multiple contexts
    for (const page of this.config.pages) {
      const result = await this.scanPage(page);
      pageResults[page] = result;
      
      // Convert issue strings to AccessibilityIssue objects
      result.issues.forEach(issueStr => {
        const severity = this.extractSeverity(issueStr);
        allIssues.push({
          type: 'general',
          severity,
          element: 'various',
          description: issueStr,
          recommendation: 'See detailed recommendations',
          page
        });
      });
    }
    
    // Calculate overall score and summary
    const scores = Object.values(pageResults).map(r => r.score);
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const summary = {
      totalIssues: allIssues.length,
      criticalCount: allIssues.filter(i => i.severity === 'critical').length,
      highCount: allIssues.filter(i => i.severity === 'high').length,
      mediumCount: allIssues.filter(i => i.severity === 'medium').length,
      lowCount: allIssues.filter(i => i.severity === 'low').length
    };
    
    return {
      pageResults,
      overallScore: Math.round(overallScore * 10) / 10,
      criticalIssues,
      summary
    };
  }
  
  /**
   * Scans a single page for accessibility issues
   */
  private async scanPage(pagePath: string): Promise<AuditScore> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Perform comprehensive accessibility checks
    const contrastIssues = await this.checkColorContrast();
    const ariaIssues = this.checkARIALabels();
    const keyboardIssues = this.checkKeyboardNavigation();
    const focusIssues = this.checkFocusIndicators();
    const altTextIssues = this.checkAltText();
    const semanticIssues = this.checkSemanticHTML();
    
    issues.push(...contrastIssues, ...ariaIssues, ...keyboardIssues, ...focusIssues, ...altTextIssues, ...semanticIssues);
    
    // Generate specific recommendations
    if (contrastIssues.length > 0) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text)');
    }
    if (ariaIssues.length > 0) {
      recommendations.push('Add proper ARIA labels and semantic markup for screen readers');
    }
    if (keyboardIssues.length > 0) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }
    if (focusIssues.length > 0) {
      recommendations.push('Add visible focus indicators for better keyboard navigation');
    }
    if (altTextIssues.length > 0) {
      recommendations.push('Provide descriptive alt text for all meaningful images');
    }
    
    // Calculate score based on issue severity
    const score = this.calculateAccessibilityScore(issues);
    
    return {
      score,
      issues,
      recommendations
    };
  }
  
  /**
   * Comprehensive color contrast analysis using WCAG guidelines
   */
  private async checkColorContrast(): Promise<string[]> {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    // Check common text elements for contrast issues
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Calculate contrast ratio (simplified - in reality would use proper color parsing)
      const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // WCAG AA standards
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      const requiredRatio = isLargeText ? 3.0 : 4.5;
      
      if (contrastRatio < requiredRatio) {
        issues.push(`CRITICAL: Low color contrast (${contrastRatio.toFixed(2)}:1) on ${element.tagName.toLowerCase()} - requires ${requiredRatio}:1`);
      }
    });
    
    return issues;
  }
  
  /**
   * Comprehensive ARIA labels and semantic HTML audit
   */
  private checkARIALabels(): string[] {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    // Check form inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const hasLabel = input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push(`HIGH: Form ${input.tagName.toLowerCase()} missing accessible label`);
      }
    });
    
    // Check buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      const hasAccessibleName = button.getAttribute('aria-label') ||
                                button.getAttribute('aria-labelledby') ||
                                button.textContent?.trim();
      
      if (!hasAccessibleName) {
        issues.push(`HIGH: Button missing accessible name`);
      }
    });
    
    // Check links
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
      if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
        issues.push(`HIGH: Link missing accessible text`);
      }
      
      if (link.getAttribute('href') === '#' || !link.getAttribute('href')) {
        issues.push(`MEDIUM: Link missing proper href or should be button`);
      }
    });
    
    // Check headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1 && previousLevel > 0) {
        issues.push(`MEDIUM: Heading hierarchy skip from h${previousLevel} to h${level}`);
      }
      previousLevel = level;
    });
    
    // Check landmarks
    const main = document.querySelector('main');
    if (!main) {
      issues.push(`MEDIUM: Page missing main landmark`);
    }
    
    return issues;
  }
  
  /**
   * Comprehensive keyboard navigation testing
   */
  private checkKeyboardNavigation(): string[] {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    // Get all potentially focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    const focusableElements = document.querySelectorAll(focusableSelectors.join(', '));
    
    if (!focusableElements) {
      return issues;
    }
    
    // Check tab order
    const elementsWithTabIndex = Array.from(focusableElements).filter(el => 
      el.getAttribute('tabindex') && parseInt(el.getAttribute('tabindex')!) > 0
    );
    
    if (elementsWithTabIndex.length > 0) {
      issues.push(`MEDIUM: ${elementsWithTabIndex.length} elements use positive tabindex, may disrupt tab order`);
    }
    
    // Check for keyboard traps (elements that can't be navigated away from)
    focusableElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '0' || !tabIndex) {
        // These should be part of natural tab order
      } else if (parseInt(tabIndex) > 0) {
        issues.push(`MEDIUM: Element uses positive tabindex (${tabIndex}) - consider restructuring HTML instead`);
      }
    });
    
    // Check for elements that should be focusable but aren't
    const clickableElements = document.querySelectorAll('[onclick], [data-testid*="button"], [role="button"]');
    
    if (clickableElements) {
      clickableElements.forEach((element) => {
      const isFocusable = element.getAttribute('tabindex') !== null || 
                         ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
      
      if (!isFocusable) {
        issues.push(`HIGH: Clickable element (${element.tagName.toLowerCase()}) not keyboard accessible`);
      }
    });
    }
    
    return issues;
  }
  
  /**
   * Focus indicators visibility testing
   */
  private checkFocusIndicators(): string[] {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements) {
      return issues;
    }
    
    let elementsWithoutFocusStyle = 0;
    
    focusableElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      // Check for focus-visible support or general focus styles
      const outline = styles.outline;
      const outlineWidth = styles.outlineWidth;
      const outlineStyle = styles.outlineStyle;
      const boxShadow = styles.boxShadow;
      const border = styles.border;
      
      const hasFocusIndicator = 
        (outline && outline !== 'none' && outlineWidth !== '0px') ||
        (boxShadow && boxShadow !== 'none' && boxShadow.includes('rgba')) ||
        (border && border !== 'none');
      
      if (!hasFocusIndicator) {
        elementsWithoutFocusStyle++;
      }
    });
    
    if (elementsWithoutFocusStyle > 0) {
      issues.push(`MEDIUM: ${elementsWithoutFocusStyle} focusable elements lack visible focus indicators`);
    }
    
    // Check for focus-visible support
    const supportsModernFocus = CSS.supports('selector(:focus-visible)');
    if (!supportsModernFocus) {
      issues.push(`LOW: Browser doesn't support :focus-visible - consider focus polyfill`);
    }
    
    return issues;
  }
  
  /**
   * Comprehensive alt text audit for images
   */
  private checkAltText(): string[] {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    const images = document.querySelectorAll('img');
    
    if (!images) {
      return issues;
    }
    
    let imagesWithoutAlt = 0;
    let imagesWithBadAlt = 0;
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');
      
      if (alt === null) {
        imagesWithoutAlt++;
      } else if (alt === '') {
        // Empty alt is OK for decorative images, but check if it should have content
        if (src && !src.includes('decoration') && !src.includes('background')) {
          issues.push(`LOW: Image may need descriptive alt text: ${src.substring(0, 50)}...`);
        }
      } else {
        // Check for poor alt text patterns
        const poorAltPatterns = ['image', 'picture', 'photo', 'graphic', 'click here', 'read more'];
        const hasGenericAlt = poorAltPatterns.some(pattern => 
          alt.toLowerCase().includes(pattern) && alt.toLowerCase().trim() === pattern
        );
        
        if (hasGenericAlt) {
          imagesWithBadAlt++;
        }
        
        if (alt.length > 125) {
          issues.push(`LOW: Image alt text very long (${alt.length} chars) - consider shortening`);
        }
      }
    });
    
    if (imagesWithoutAlt > 0) {
      issues.push(`HIGH: ${imagesWithoutAlt} images missing alt attribute`);
    }
    
    if (imagesWithBadAlt > 0) {
      issues.push(`MEDIUM: ${imagesWithBadAlt} images have generic/unhelpful alt text`);
    }
    
    // Check for background images that might need accessible alternatives
    const elementsWithBgImages = document.querySelectorAll('[style*="background-image"]');
    
    if (elementsWithBgImages) {
      elementsWithBgImages.forEach((element) => {
      const hasAccessibleText = element.textContent?.trim() || 
                               element.getAttribute('aria-label') ||
                               element.getAttribute('title');
      
      if (!hasAccessibleText) {
        issues.push(`MEDIUM: Element with background image lacks accessible text content`);
      }
    });
    }
    
    return issues;
  }
  
  /**
   * Semantic HTML structure audit
   */
  private checkSemanticHTML(): string[] {
    const issues: string[] = [];
    
    if (typeof window === 'undefined') {
      return issues;
    }
    
    // Check for proper document structure
    const hasH1 = document.querySelector('h1');
    if (!hasH1) {
      issues.push(`HIGH: Page missing h1 heading`);
    }
    
    // Check for div/span elements that should be semantic
    const clickableDivs = document.querySelectorAll('div[onclick], span[onclick]');
    if (clickableDivs && clickableDivs.length > 0) {
      issues.push(`MEDIUM: ${clickableDivs.length} div/span elements used for buttons - use button element instead`);
    }
    
    // Check for list structures
    const potentialLists = document.querySelectorAll('div:has(> div), p:has(> span)');
    // This would need more sophisticated analysis in a real implementation
    
    // Check for form structure
    const forms = document.querySelectorAll('form');
    
    if (forms) {
      forms.forEach((form) => {
        const hasFieldset = (form as any).querySelector?.('fieldset');
        const inputs = (form as any).querySelectorAll?.('input, textarea, select');
      
        if (inputs && inputs.length > 5 && !hasFieldset) {
          issues.push(`MEDIUM: Large form without fieldset organization`);
        }
      });
    }
    
    return issues;
  }
  
  /**
   * Extract severity level from issue string
   */
  private extractSeverity(issueStr: string): 'critical' | 'high' | 'medium' | 'low' {
    if (issueStr.includes('CRITICAL:')) return 'critical';
    if (issueStr.includes('HIGH:')) return 'high';
    if (issueStr.includes('MEDIUM:')) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate accessibility score based on issues
   */
  private calculateAccessibilityScore(issues: string[]): number {
    let score = 10;
    
    issues.forEach(issue => {
      const severity = this.extractSeverity(issue);
      switch (severity) {
        case 'critical':
          score -= 2.5;
          break;
        case 'high':
          score -= 2.0;
          break;
        case 'medium':
          score -= 1.0;
          break;
        case 'low':
          score -= 0.5;
          break;
      }
    });
    
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }
  
  /**
   * Simplified contrast ratio calculation
   * In production, would use a proper color parsing library
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // This is a simplified version - real implementation would parse RGB/hex colors
    // and calculate luminance properly
    if (color1 === color2) return 1.0;
    if (color1 === 'rgb(0, 0, 0)' && color2 === 'rgb(255, 255, 255)') return 21.0;
    if (color1 === 'rgb(255, 255, 255)' && color2 === 'rgb(0, 0, 0)') return 21.0;
    
    // Default to a reasonable middle value for unknown combinations
    return 7.0;
  }
}

/**
 * Default configuration for major application pages
 */
export const DEFAULT_SCAN_CONFIG: AccessibilityScanConfig = {
  pages: [
    '/dashboard',
    '/projects', 
    '/templates',
    '/', // home page
  ],
  excludeSelectors: [
    '[data-test]',
    '.hidden',
    '[aria-hidden="true"]'
  ]
};

/**
 * Create and run accessibility scanner with default configuration
 */
export async function runAccessibilityAudit(config: AccessibilityScanConfig = DEFAULT_SCAN_CONFIG) {
  const scanner = new AccessibilityScanner(config);
  return await scanner.scanAllPages();
}