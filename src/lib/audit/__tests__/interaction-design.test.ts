import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  analyzeLoadingStates,
  analyzeEmptyStates,
  analyzeErrorStates,
  analyzeMicroInteractions,
  analyzeFeedback,
  auditInteractionDesign
} from '../interaction-design';

// Mock DOM methods
const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockGetComputedStyle = vi.fn();

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Mock window and document
  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
    writable: true
  });
  
  Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true
  });
  
  Object.defineProperty(document, 'querySelectorAll', {
    value: mockQuerySelectorAll,
    writable: true
  });
  
  // Default mock implementations
  mockQuerySelector.mockReturnValue(null);
  mockQuerySelectorAll.mockReturnValue([]);
  mockGetComputedStyle.mockReturnValue({
    transition: 'all 0s ease 0s',
    cursor: 'default',
    outline: 'none',
    transform: 'none',
    animation: 'none'
  });
});

describe('analyzeLoadingStates', () => {
  it('should detect forms without loading states', () => {
    const mockForm = {
      querySelectorAll: vi.fn().mockReturnValue([{
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }])
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [mockForm];
      return []; // No async content areas
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeLoadingStates();
    
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: 'loading-states',
      severity: 'high',
      description: 'Submit button lacks loading state indicators'
    });
  });
  
  it('should pass when buttons have loading indicators', () => {
    const mockForm = {
      querySelectorAll: vi.fn().mockReturnValue([{
        className: 'loading-button',
        getAttribute: vi.fn().mockReturnValue(null)
      }])
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [mockForm];
      return []; // No async content areas
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeLoadingStates();
    
    expect(issues).toHaveLength(0);
  });
  
  it('should pass when buttons have aria-busy attribute', () => {
    const mockForm = {
      querySelectorAll: vi.fn().mockReturnValue([{
        className: '',
        getAttribute: vi.fn().mockImplementation(attr => 
          attr === 'aria-busy' ? 'true' : null
        )
      }])
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [mockForm];
      return []; // No async content areas
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeLoadingStates();
    
    expect(issues).toHaveLength(0);
  });
  
  it('should detect missing global loaders for async content', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('data-async')) return [{}]; // Has async content
      if (selector.includes('loader')) return []; // No loaders
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No global loader
    
    const issues = analyzeLoadingStates();
    
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: 'loading-states',
      severity: 'medium',
      description: 'No visible loading indicators found for async content'
    });
  });
  
  it('should pass when global loader exists', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('data-async')) return [{}];
      return [];
    });
    
    mockQuerySelector.mockReturnValue({}); // Has global loader
    
    const issues = analyzeLoadingStates();
    
    expect(issues).toHaveLength(0);
  });
});

describe('analyzeEmptyStates', () => {
  it('should detect empty containers without empty states', () => {
    const mockContainer = {
      children: [], // Empty container
      querySelector: vi.fn().mockReturnValue(null) // No empty state
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('ul') || selector.includes('list')) return [mockContainer];
      return []; // No search inputs
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeEmptyStates();
    
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: 'empty-states',
      severity: 'medium',
      description: 'Empty container lacks empty state messaging'
    });
  });
  
  it('should pass when empty containers have empty states', () => {
    const mockContainer = {
      children: [],
      querySelector: vi.fn().mockReturnValue({}) // Has empty state
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('ul') || selector.includes('list')) return [mockContainer];
      return []; // No search inputs
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeEmptyStates();
    
    expect(issues).toHaveLength(0);
  });
  
  it('should detect search without no-results state', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('search')) return [{}]; // Has search
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No no-results state
    
    const issues = analyzeEmptyStates();
    
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      type: 'empty-states',
      severity: 'low',
      description: 'Search functionality lacks "no results" state design'
    });
  });
  
  it('should pass when search has no-results state', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('search')) return [{}];
      return [];
    });
    
    mockQuerySelector.mockReturnValue({}); // Has no-results state
    
    const issues = analyzeEmptyStates();
    
    expect(issues).toHaveLength(0);
  });
});

describe('analyzeErrorStates', () => {
  it('should detect forms without error messaging', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('input')) return [{
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }]; // Has form inputs
      if (selector.includes('error')) return []; // No error messages
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeErrorStates();
    
    expect(issues).toHaveLength(3); // Should detect multiple error state issues
    expect(issues[0]).toMatchObject({
      type: 'error-states',
      severity: 'high',
      description: 'Forms lack error message display areas'
    });
  });
  
  it('should pass when forms have error messages', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('input')) return [{
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }];
      if (selector.includes('error')) return [{}]; // Has error messages
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const issues = analyzeErrorStates();
    
    expect(issues).toHaveLength(2); // Should still detect global and offline errors
    expect(issues.find(i => i.description.includes('Forms lack error message'))).toBeFalsy();
  });
  
  it('should detect missing global error boundary', () => {
    mockQuerySelectorAll.mockReturnValue([]);
    mockQuerySelector.mockReturnValue(null); // No error boundary
    
    const issues = analyzeErrorStates();
    
    const errorBoundaryIssue = issues.find(i => i.description.includes('global error handling'));
    expect(errorBoundaryIssue).toMatchObject({
      type: 'error-states',
      severity: 'medium',
      description: 'No global error handling UI detected'
    });
  });
  
  it('should detect missing offline state', () => {
    mockQuerySelectorAll.mockReturnValue([]);
    mockQuerySelector.mockReturnValue(null); // No offline state
    
    const issues = analyzeErrorStates();
    
    const offlineIssue = issues.find(i => i.description.includes('offline'));
    expect(offlineIssue).toMatchObject({
      type: 'error-states',
      severity: 'low',
      description: 'No offline/network error state detected'
    });
  });
});

describe('analyzeMicroInteractions', () => {
  it('should detect interactive elements without pointer cursor', () => {
    mockQuerySelectorAll.mockReturnValue([
      { tagName: { toLowerCase: () => 'button' } },
      { tagName: { toLowerCase: () => 'a' } }
    ]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0s ease 0s',
      cursor: 'default', // Not pointer
      outline: 'none',
      transform: 'none',
      animation: 'none'
    });
    
    const issues = analyzeMicroInteractions();
    
    const cursorIssues = issues.filter(i => i.description.includes('pointer cursor'));
    expect(cursorIssues).toHaveLength(2);
    expect(cursorIssues[0]).toMatchObject({
      type: 'micro-interactions',
      severity: 'low',
      description: 'Interactive element lacks pointer cursor'
    });
  });
  
  it('should detect missing hover effects', () => {
    mockQuerySelectorAll.mockReturnValue([{}]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0s ease 0s', // No transitions
      cursor: 'pointer',
      outline: 'none',
      transform: 'none',
      animation: 'none'
    });
    
    const issues = analyzeMicroInteractions();
    
    const hoverIssue = issues.find(i => i.description.includes('hover/focus transition'));
    expect(hoverIssue).toMatchObject({
      type: 'micro-interactions',
      severity: 'medium',
      description: 'Interactive elements lack hover/focus transition effects'
    });
  });
  
  it('should pass when elements have transitions', () => {
    mockQuerySelectorAll.mockReturnValue([{}]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0.2s ease', // Has transitions
      cursor: 'pointer',
      outline: 'none',
      transform: 'none',
      animation: 'none'
    });
    
    const issues = analyzeMicroInteractions();
    
    const hoverIssue = issues.find(i => i.description.includes('hover/focus transition'));
    expect(hoverIssue).toBeFalsy();
  });
  
  it('should detect missing focus states', () => {
    mockQuerySelectorAll.mockReturnValue([{}]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      outline: 'none', // No focus outline
      transform: 'none',
      animation: 'none'
    });
    
    const issues = analyzeMicroInteractions();
    
    const focusIssue = issues.find(i => i.description.includes('focus states'));
    expect(focusIssue).toMatchObject({
      type: 'micro-interactions',
      severity: 'high',
      description: 'Interactive elements lack visible focus states'
    });
  });
  
  it('should pass when elements have focus states', () => {
    mockQuerySelectorAll.mockReturnValue([{}]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      outline: '2px solid blue', // Has focus outline
      transform: 'none',
      animation: 'none'
    });
    
    const issues = analyzeMicroInteractions();
    
    const focusIssue = issues.find(i => i.description.includes('focus states'));
    expect(focusIssue).toBeFalsy();
  });
  
  it('should detect expensive animations', () => {
    mockQuerySelectorAll.mockReturnValue([{}]);
    
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      outline: '2px solid blue',
      transform: 'none',
      animation: 'width 1s ease' // Layout-triggering animation
    });
    
    const issues = analyzeMicroInteractions();
    
    const expensiveAnimationIssue = issues.find(i => i.description.includes('performance-heavy'));
    expect(expensiveAnimationIssue).toMatchObject({
      type: 'micro-interactions',
      severity: 'medium',
      description: 'Detected potentially performance-heavy animations'
    });
  });
});

describe('analyzeFeedback', () => {
  it('should detect forms without success messages', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [{}]; // Has forms
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No success messages
    
    const issues = analyzeFeedback();
    
    const successIssue = issues.find(i => i.description.includes('success confirmation'));
    expect(successIssue).toMatchObject({
      type: 'feedback',
      severity: 'medium',
      description: 'Forms lack success confirmation messaging'
    });
  });
  
  it('should pass when success messages exist', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [{}];
      return [];
    });
    
    mockQuerySelector.mockReturnValue({}); // Has success messages
    
    const issues = analyzeFeedback();
    
    const successIssue = issues.find(i => i.description.includes('success confirmation'));
    expect(successIssue).toBeFalsy();
  });
  
  it('should detect multi-step processes without progress indicators', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('step-')) return [{}, {}]; // Multiple steps
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No progress indicator
    
    const issues = analyzeFeedback();
    
    const progressIssue = issues.find(i => i.description.includes('progress indicators'));
    expect(progressIssue).toMatchObject({
      type: 'feedback',
      severity: 'medium',
      description: 'Multi-step process lacks progress indicators'
    });
  });
  
  it('should detect complex inputs without tooltips', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('password')) return [{}]; // Has complex inputs
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No tooltips
    
    const issues = analyzeFeedback();
    
    const tooltipIssue = issues.find(i => i.description.includes('tooltips'));
    expect(tooltipIssue).toMatchObject({
      type: 'feedback',
      severity: 'low',
      description: 'Complex form fields lack helpful tooltips or descriptions'
    });
  });
  
  it('should detect destructive actions without undo capability', () => {
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('delete')) return [{}]; // Has destructive actions
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null); // No undo capability
    
    const issues = analyzeFeedback();
    
    const undoIssue = issues.find(i => i.description.includes('undo capability'));
    expect(undoIssue).toMatchObject({
      type: 'feedback',
      severity: 'low',
      description: 'Destructive actions lack undo capability or confirmation'
    });
  });
});

describe('auditInteractionDesign', () => {
  it('should return a valid audit score', () => {
    // Mock minimal DOM to avoid issues
    mockQuerySelectorAll.mockReturnValue([]);
    mockQuerySelector.mockReturnValue(null);
    
    const audit = auditInteractionDesign();
    
    expect(audit).toHaveProperty('score');
    expect(audit.score).toBeGreaterThanOrEqual(1);
    expect(audit.score).toBeLessThanOrEqual(10);
    expect(audit).toHaveProperty('issues');
    expect(audit).toHaveProperty('recommendations');
    expect(Array.isArray(audit.issues)).toBe(true);
    expect(Array.isArray(audit.recommendations)).toBe(true);
  });
  
  it('should calculate score based on issue severity', () => {
    // Mock severe issues
    const mockForm = {
      querySelectorAll: vi.fn().mockReturnValue([{
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }])
    };
    
    const mockContainer = {
      children: [],
      querySelector: vi.fn().mockReturnValue(null)
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return [mockForm];
      if (selector.includes('input') && !selector.includes('button')) return [{
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }];
      if (selector.includes('button') || selector.includes('onclick')) return [{ tagName: 'BUTTON' }];
      if (selector.includes('delete')) return [{}];
      if (selector.includes('ul') || selector.includes('list')) return [mockContainer];
      return [];
    });
    
    mockQuerySelector.mockReturnValue(null);
    mockGetComputedStyle.mockReturnValue({
      transition: 'all 0s ease 0s',
      cursor: 'default',
      outline: 'none',
      transform: 'none',
      animation: 'none'
    });
    
    const audit = auditInteractionDesign();
    
    expect(audit.score).toBeLessThan(10); // Should be penalized for issues
    expect(audit.issues.length).toBeGreaterThan(0);
  });
  
  it('should include proper recommendations', () => {
    mockQuerySelectorAll.mockReturnValue([]);
    mockQuerySelector.mockReturnValue(null);
    
    const audit = auditInteractionDesign();
    
    expect(audit.recommendations).toContain('Implement comprehensive loading states for all async operations');
    expect(audit.recommendations).toContain('Design helpful empty states with clear next actions');
    expect(audit.recommendations).toContain('Add robust error handling with recovery options');
    expect(audit.recommendations).toContain('Include subtle micro-interactions for better user feedback');
  });
  
  it('should limit score between 1 and 10', () => {
    // Mock many severe issues to test score limits
    const mockForm = {
      querySelectorAll: vi.fn().mockReturnValue(Array(10).fill({
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      }))
    };
    
    const mockContainer = {
      children: [],
      querySelector: vi.fn().mockReturnValue(null)
    };
    
    mockQuerySelectorAll.mockImplementation(selector => {
      if (selector.includes('form')) return Array(10).fill(mockForm);
      if (selector.includes('input') && !selector.includes('button')) return Array(10).fill({
        className: '',
        getAttribute: vi.fn().mockReturnValue(null)
      });
      if (selector.includes('button') || selector.includes('onclick')) return Array(10).fill({ tagName: 'BUTTON' });
      if (selector.includes('ul') || selector.includes('list')) return Array(10).fill(mockContainer);
      return Array(10).fill({});
    });
    
    mockQuerySelector.mockReturnValue(null);
    
    const audit = auditInteractionDesign();
    
    expect(audit.score).toBeGreaterThanOrEqual(1);
    expect(audit.score).toBeLessThanOrEqual(10);
  });
  
  it('should handle window undefined gracefully', () => {
    // Temporarily remove window
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    const audit = auditInteractionDesign();
    
    expect(audit.score).toBe(10); // Perfect score when no window
    expect(audit.issues).toHaveLength(0);
    expect(audit.recommendations).toHaveLength(7);
    
    // Restore window
    global.window = originalWindow;
  });
});