import type { AuditScore } from './types';

interface InteractionIssue {
  type: 'loading-states' | 'empty-states' | 'error-states' | 'micro-interactions' | 'feedback';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

/**
 * Analyzes loading states and indicators
 */
export function analyzeLoadingStates(): InteractionIssue[] {
  const issues: InteractionIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for forms without loading states
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      
      submitButtons.forEach((button) => {
        // Check if button has loading/disabled state handling
        const hasLoadingClass = button.className.includes('loading') || 
                               button.className.includes('spinner') ||
                               button.className.includes('disabled');
        
        const hasAriaLoading = button.getAttribute('aria-busy') || 
                              button.getAttribute('aria-disabled');
        
        if (!hasLoadingClass && !hasAriaLoading) {
          issues.push({
            type: 'loading-states',
            severity: 'high',
            description: 'Submit button lacks loading state indicators',
            recommendation: 'Add loading spinner and disable button during form submission'
          });
        }
      });
    });
    
    // Check for async content areas without loading indicators
    const contentAreas = document.querySelectorAll('[data-async], [class*="async"], [id*="content"]');
    if (contentAreas.length > 0) {
      // This is a heuristic check - in reality we'd analyze if these areas show loading states
      const hasGlobalLoader = document.querySelector('[class*="loader"], [class*="loading"], [class*="spinner"]');
      
      if (!hasGlobalLoader) {
        issues.push({
          type: 'loading-states',
          severity: 'medium',
          description: 'No visible loading indicators found for async content',
          recommendation: 'Implement loading spinners or skeleton screens for dynamic content'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Analyzes empty states
 */
export function analyzeEmptyStates(): InteractionIssue[] {
  const issues: InteractionIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for lists/containers that might need empty states
    const listElements = document.querySelectorAll('ul, ol, table tbody, [class*="list"], [class*="grid"]');
    
    listElements.forEach((element) => {
      const children = element.children;
      
      // If container is empty or has minimal content
      if (children.length === 0) {
        const hasEmptyState = element.querySelector('[class*="empty"], [class*="no-"], [data-empty]');
        
        if (!hasEmptyState) {
          issues.push({
            type: 'empty-states',
            severity: 'medium',
            description: 'Empty container lacks empty state messaging',
            recommendation: 'Add helpful empty state with illustration and clear action'
          });
        }
      }
    });
    
    // Check for search/filter areas without empty state handling
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i]');
    if (searchInputs.length > 0) {
      const hasNoResultsState = document.querySelector('[class*="no-results"], [class*="empty-search"]');
      
      if (!hasNoResultsState) {
        issues.push({
          type: 'empty-states',
          severity: 'low',
          description: 'Search functionality lacks "no results" state design',
          recommendation: 'Design empty state for when search returns no results'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Analyzes error states and handling
 */
export function analyzeErrorStates(): InteractionIssue[] {
  const issues: InteractionIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check forms for error state handling
    const formInputs = document.querySelectorAll('input, textarea, select');
    let hasErrorStyling = false;
    
    formInputs.forEach((input) => {
      const hasErrorClass = input.className.includes('error') || 
                           input.className.includes('invalid') ||
                           input.getAttribute('aria-invalid') === 'true';
      
      if (hasErrorClass) {
        hasErrorStyling = true;
      }
    });
    
    // Check if there are error message containers
    const errorMessages = document.querySelectorAll('[class*="error"], [role="alert"], [class*="invalid"]');
    
    if (formInputs.length > 0 && errorMessages.length === 0) {
      issues.push({
        type: 'error-states',
        severity: 'high',
        description: 'Forms lack error message display areas',
        recommendation: 'Add error message containers and validation feedback'
      });
    }
    
    // Check for global error boundaries
    const hasErrorBoundary = document.querySelector('[class*="error-boundary"], [id*="error"]');
    if (!hasErrorBoundary) {
      issues.push({
        type: 'error-states',
        severity: 'medium',
        description: 'No global error handling UI detected',
        recommendation: 'Implement error boundary component for graceful error handling'
      });
    }
    
    // Check for network error handling
    const hasOfflineState = document.querySelector('[class*="offline"], [class*="network-error"]');
    if (!hasOfflineState) {
      issues.push({
        type: 'error-states',
        severity: 'low',
        description: 'No offline/network error state detected',
        recommendation: 'Add offline state and network error handling'
      });
    }
  }
  
  return issues;
}

/**
 * Analyzes micro-interactions and animations
 */
export function analyzeMicroInteractions(): InteractionIssue[] {
  const issues: InteractionIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input[type="submit"], [onclick]');
    let hasHoverEffects = false;
    
    interactiveElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const transition = styles.transition;
      const cursor = styles.cursor;
      
      if (transition !== 'all 0s ease 0s' && transition !== 'none') {
        hasHoverEffects = true;
      }
      
      if (cursor !== 'pointer' && element.tagName.toLowerCase() !== 'input') {
        issues.push({
          type: 'micro-interactions',
          severity: 'low',
          description: `Interactive element lacks pointer cursor`,
          recommendation: 'Add cursor: pointer to interactive elements for better UX'
        });
      }
    });
    
    if (!hasHoverEffects && interactiveElements.length > 0) {
      issues.push({
        type: 'micro-interactions',
        severity: 'medium',
        description: 'Interactive elements lack hover/focus transition effects',
        recommendation: 'Add subtle transitions to buttons and links for better feedback'
      });
    }
    
    // Check for focus states
    let hasFocusStyles = false;
    interactiveElements.forEach((element) => {
      // This is a simplified check - would need to actually trigger focus to see styles
      const styles = window.getComputedStyle(element as HTMLElement);
      const outline = styles.outline;
      
      if (outline !== 'none') {
        hasFocusStyles = true;
      }
    });
    
    if (!hasFocusStyles && interactiveElements.length > 0) {
      issues.push({
        type: 'micro-interactions',
        severity: 'high',
        description: 'Interactive elements lack visible focus states',
        recommendation: 'Add clear focus indicators for keyboard navigation'
      });
    }
    
    // Check for animation performance considerations
    const animatedElements = document.querySelectorAll('*');
    let hasExpensiveAnimations = false;
    
    animatedElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const transform = styles.transform;
      const animation = styles.animation;
      
      // Check for layout-triggering animations (not transform/opacity based)
      if ((animation !== 'none' || transform !== 'none') && 
          (animation.includes('width') || animation.includes('height') || 
           animation.includes('top') || animation.includes('left'))) {
        hasExpensiveAnimations = true;
      }
    });
    
    if (hasExpensiveAnimations) {
      issues.push({
        type: 'micro-interactions',
        severity: 'medium',
        description: 'Detected potentially performance-heavy animations',
        recommendation: 'Use transform and opacity for animations instead of layout properties'
      });
    }
  }
  
  return issues;
}

/**
 * Analyzes user feedback mechanisms
 */
export function analyzeFeedback(): InteractionIssue[] {
  const issues: InteractionIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for success feedback after actions
    const forms = document.querySelectorAll('form');
    const hasSuccessMessage = document.querySelector('[class*="success"], [class*="confirmation"], [role="status"]');
    
    if (forms.length > 0 && !hasSuccessMessage) {
      issues.push({
        type: 'feedback',
        severity: 'medium',
        description: 'Forms lack success confirmation messaging',
        recommendation: 'Add success messages to confirm completed actions'
      });
    }
    
    // Check for progress indicators on multi-step processes
    const hasStepIndicator = document.querySelector('[class*="step"], [class*="progress"], [class*="breadcrumb"]');
    const hasMultipleSteps = document.querySelectorAll('[class*="step-"], [data-step]').length > 1;
    
    if (hasMultipleSteps && !hasStepIndicator) {
      issues.push({
        type: 'feedback',
        severity: 'medium',
        description: 'Multi-step process lacks progress indicators',
        recommendation: 'Add step indicators to show progress in multi-step flows'
      });
    }
    
    // Check for tooltip help text
    const complexInputs = document.querySelectorAll('input[type="password"], input[type="email"], textarea');
    const hasTooltips = document.querySelector('[title], [class*="tooltip"], [aria-describedby]');
    
    if (complexInputs.length > 0 && !hasTooltips) {
      issues.push({
        type: 'feedback',
        severity: 'low',
        description: 'Complex form fields lack helpful tooltips or descriptions',
        recommendation: 'Add tooltips or help text for complex form fields'
      });
    }
    
    // Check for undo/redo functionality hints
    const destructiveActions = document.querySelectorAll('[class*="delete"], [class*="remove"], button[class*="danger"]');
    const hasUndoCapability = document.querySelector('[class*="undo"], [data-undo]');
    
    if (destructiveActions.length > 0 && !hasUndoCapability) {
      issues.push({
        type: 'feedback',
        severity: 'low',
        description: 'Destructive actions lack undo capability or confirmation',
        recommendation: 'Add confirmation dialogs or undo functionality for destructive actions'
      });
    }
  }
  
  return issues;
}

/**
 * Runs a comprehensive interaction design audit
 */
export function auditInteractionDesign(): AuditScore {
  const issues: InteractionIssue[] = [];
  const recommendations: string[] = [];
  
  // Collect all interaction design issues
  issues.push(...analyzeLoadingStates());
  issues.push(...analyzeEmptyStates());
  issues.push(...analyzeErrorStates());
  issues.push(...analyzeMicroInteractions());
  issues.push(...analyzeFeedback());
  
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
  recommendations.push('Implement comprehensive loading states for all async operations');
  recommendations.push('Design helpful empty states with clear next actions');
  recommendations.push('Add robust error handling with recovery options');
  recommendations.push('Include subtle micro-interactions for better user feedback');
  recommendations.push('Ensure all interactive elements have hover and focus states');
  recommendations.push('Add progress indicators for multi-step processes');
  recommendations.push('Implement success confirmations for completed actions');
  
  return {
    score: Math.round(score * 10) / 10,
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
}