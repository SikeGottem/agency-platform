import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  analyzeColorContrast, 
  analyzeARIA, 
  analyzeKeyboardNavigation, 
  analyzeFocusIndicators,
  auditAccessibilitySync 
} from '../accessibility';
import { AccessibilityScanner, DEFAULT_SCAN_CONFIG } from '../accessibility-scanner';

// Mock DOM environment
const createMockElement = (tagName: string, attributes: Record<string, string | null> = {}, textContent = '') => ({
  tagName,
  getAttribute: vi.fn((attr: string) => attributes.hasOwnProperty(attr) ? attributes[attr] : null),
  textContent,
  id: attributes.id || ''
} as unknown as HTMLElement);

// Mock window.getComputedStyle
const mockGetComputedStyle = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
    writable: true
  });
  
  // Mock CSS.supports
  Object.defineProperty(CSS, 'supports', {
    value: vi.fn().mockReturnValue(true),
    writable: true
  });
});

describe('accessibility audit', () => {
  describe('analyzeColorContrast', () => {
    it('should detect low contrast ratios', () => {
      const element = createMockElement('P');
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(128, 128, 128)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const issues = analyzeColorContrast(element);
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('contrast');
      expect(issues[0].severity).toBe('high');
      expect(issues[0].description).toContain('contrast ratio');
    });

    it('should detect critical contrast issues for same colors', () => {
      const element = createMockElement('P');
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const issues = analyzeColorContrast(element);
      
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('critical');
    });

    it('should handle large text with lower contrast requirements', () => {
      const element = createMockElement('H1');
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '24px',
        fontWeight: 'bold'
      });

      const issues = analyzeColorContrast(element);
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeARIA', () => {
    it('should detect images missing alt text', () => {
      const mockImg = createMockElement('IMG', { alt: null, src: 'test.jpg' });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockImg] as any);

      const issues = analyzeARIA();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'alt-text',
        severity: 'high',
        element: 'img',
        description: 'Image missing alt attribute',
        recommendation: 'Add descriptive alt text or alt="" for decorative images'
      });
    });

    it('should warn about potentially decorative images with empty alt', () => {
      const mockImg = createMockElement('IMG', { alt: '', src: 'content-image.jpg' });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockImg] as any);
      vi.spyOn(document, 'querySelector').mockReturnValue(null); // Ensure no label queries interfere

      const issues = analyzeARIA();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('alt-text');
      expect(issues[0].severity).toBe('medium');
    });

    it('should detect form inputs without labels', () => {
      const mockInput = createMockElement('INPUT', { type: 'text', id: 'test-input' });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockInput] as any);
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const issues = analyzeARIA();
      
      const labelIssue = issues.find(i => i.description.includes('Form input missing'));
      expect(labelIssue).toBeTruthy();
      expect(labelIssue?.severity).toBe('high');
    });

    it('should detect buttons without accessible names', () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockButton] as any);

      const issues = analyzeARIA();
      
      const buttonIssue = issues.find(i => i.description.includes('Interactive element lacks accessible name'));
      expect(buttonIssue).toBeTruthy();
      expect(buttonIssue?.type).toBe('aria');
    });

    it('should not flag properly labeled elements', () => {
      const mockButton = createMockElement('BUTTON', { 'aria-label': 'Submit form' }, 'Submit');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockButton] as any);

      const issues = analyzeARIA();
      expect(issues.filter(i => i.element === 'button')).toHaveLength(0);
    });
  });

  describe('analyzeKeyboardNavigation', () => {
    it('should detect elements with positive tabindex', () => {
      const mockElement = createMockElement('DIV', { tabindex: '5' });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement] as any);

      const issues = analyzeKeyboardNavigation();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('keyboard-navigation');
      expect(issues[0].severity).toBe('medium');
      expect(issues[0].description).toContain('positive tabindex');
    });

    it('should detect clickable elements that are not keyboard accessible', () => {
      const mockDiv = createMockElement('DIV', { onclick: 'alert("click")' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // First call for focusable elements
        .mockReturnValueOnce([mockDiv] as any); // Second call for clickable elements

      const issues = analyzeKeyboardNavigation();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('keyboard-navigation');
      expect(issues[0].severity).toBe('high');
      expect(issues[0].description).toContain('not keyboard accessible');
    });
  });

  describe('analyzeFocusIndicators', () => {
    it('should detect elements without focus indicators', () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockButton] as any);
      
      mockGetComputedStyle.mockReturnValue({
        outline: 'none',
        outlineWidth: '0px',
        boxShadow: 'none'
      });

      const issues = analyzeFocusIndicators();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('focus-indicators');
      expect(issues[0].severity).toBe('medium');
      expect(issues[0].description).toContain('lack visible focus indicators');
    });

    it('should not flag elements with proper focus indicators', () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockButton] as any);
      
      mockGetComputedStyle.mockReturnValue({
        outline: '2px solid blue',
        outlineWidth: '2px',
        boxShadow: 'none'
      });

      const issues = analyzeFocusIndicators();
      expect(issues).toHaveLength(0);
    });
  });

  describe('auditAccessibilitySync', () => {
    beforeEach(() => {
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal',
        outline: '2px solid blue',
        outlineWidth: '2px',
        boxShadow: 'none'
      });
    });

    it('should return a complete audit score', () => {
      const result = auditAccessibilitySync();
      
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should calculate score based on issue severity', () => {
      // Mock to return issues
      const mockImg = createMockElement('IMG', { alt: null });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockImg] as any);

      const result = auditAccessibilitySync();
      
      // Should have lower score due to high severity issue
      expect(result.score).toBeLessThan(10);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.includes('HIGH:'))).toBe(true);
    });

    it('should include comprehensive recommendations', () => {
      const result = auditAccessibilitySync();
      
      expect(result.recommendations).toContain('Run comprehensive accessibility audit with axe-core');
      expect(result.recommendations).toContain('Test keyboard navigation manually');
      expect(result.recommendations).toContain('Verify screen reader compatibility');
    });

    it('should prioritize critical and high issues in recommendations', () => {
      // Mock critical contrast issue by calling the function with a specific element
      const mockElement = createMockElement('P');
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const result = auditAccessibilitySync(mockElement);
      
      expect(result.recommendations[0]).toContain('Address critical accessibility issues');
    });
  });

  describe('AccessibilityScanner', () => {
    it('should initialize with default config', () => {
      expect(DEFAULT_SCAN_CONFIG.pages).toContain('/dashboard');
      expect(DEFAULT_SCAN_CONFIG.pages).toContain('/projects');
      expect(DEFAULT_SCAN_CONFIG.pages).toContain('/templates');
      expect(DEFAULT_SCAN_CONFIG.pages).toContain('/');
    });

    it('should create scanner with custom config', () => {
      const customConfig = {
        pages: ['/custom-page'],
        excludeSelectors: ['.test']
      };
      
      const scanner = new AccessibilityScanner(customConfig);
      expect(scanner).toBeInstanceOf(AccessibilityScanner);
    });

    it('should scan all pages and return summary', async () => {
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      
      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result).toHaveProperty('pageResults');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('criticalIssues');
      expect(result).toHaveProperty('summary');
      
      expect(result.summary).toHaveProperty('totalIssues');
      expect(result.summary).toHaveProperty('criticalCount');
      expect(result.summary).toHaveProperty('highCount');
      expect(result.summary).toHaveProperty('mediumCount');
      expect(result.summary).toHaveProperty('lowCount');
    });
  });
});