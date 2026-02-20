import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccessibilityScanner, DEFAULT_SCAN_CONFIG, runAccessibilityAudit } from '../accessibility-scanner';

// Mock DOM environment
const createMockElement = (tagName: string, attributes: Record<string, string | null> = {}, textContent = '') => ({
  tagName,
  getAttribute: vi.fn((attr: string) => attributes[attr] || null),
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
  
  // Reset DOM queries
  vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
  vi.spyOn(document, 'querySelector').mockReturnValue(null);
});

describe('AccessibilityScanner', () => {
  describe('configuration', () => {
    it('should use default configuration for major pages', () => {
      expect(DEFAULT_SCAN_CONFIG.pages).toEqual([
        '/dashboard',
        '/projects', 
        '/templates',
        '/'
      ]);
      
      expect(DEFAULT_SCAN_CONFIG.excludeSelectors).toContain('[data-test]');
      expect(DEFAULT_SCAN_CONFIG.excludeSelectors).toContain('.hidden');
      expect(DEFAULT_SCAN_CONFIG.excludeSelectors).toContain('[aria-hidden="true"]');
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        pages: ['/admin', '/settings'],
        baseUrl: 'https://example.com',
        excludeSelectors: ['.test-only']
      };
      
      const scanner = new AccessibilityScanner(customConfig);
      expect(scanner).toBeInstanceOf(AccessibilityScanner);
    });
  });

  describe('color contrast analysis', () => {
    it('should detect critical contrast issues', async () => {
      const mockElement = createMockElement('P');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement] as any);
      
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.criticalCount).toBeGreaterThan(0);
      expect(result.criticalIssues.some(issue => 
        issue.description.includes('contrast')
      )).toBe(true);
    });

    it('should handle different font sizes for contrast requirements', async () => {
      const largeTextElement = createMockElement('H1');
      const normalTextElement = createMockElement('P');
      
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([largeTextElement, normalTextElement] as any);
      
      mockGetComputedStyle
        .mockReturnValueOnce({
          color: 'rgb(100, 100, 100)',
          backgroundColor: 'rgb(255, 255, 255)',
          fontSize: '24px', // Large text
          fontWeight: 'bold'
        })
        .mockReturnValueOnce({
          color: 'rgb(100, 100, 100)',
          backgroundColor: 'rgb(255, 255, 255)',
          fontSize: '16px', // Normal text
          fontWeight: 'normal'
        });

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      // Should find issues since both don't meet their respective requirements
      expect(result.summary.totalIssues).toBeGreaterThan(0);
    });
  });

  describe('ARIA and semantic HTML analysis', () => {
    it('should detect missing form labels', async () => {
      const mockInput = createMockElement('INPUT', { type: 'text', id: 'test' });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockInput] as any);

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.highCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('Form input missing')
      )).toBe(true);
    });

    it('should detect buttons without accessible names', async () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockButton] as any);

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.highCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('accessible name')
      )).toBe(true);
    });

    it('should detect missing page headings', async () => {
      // Mock no h1 element
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('missing h1')
      )).toBe(true);
    });

    it('should detect improper use of div/span for buttons', async () => {
      const mockClickableDiv = createMockElement('DIV', { onclick: 'handleClick()' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements
        .mockReturnValueOnce([] as any) // clickable elements  
        .mockReturnValueOnce([] as any) // focus indicators check
        .mockReturnValueOnce([] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([mockClickableDiv] as any); // clickable divs for semantic check
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('div/span elements used for buttons')
      )).toBe(true);
    });
  });

  describe('keyboard navigation analysis', () => {
    it('should detect positive tabindex usage', async () => {
      const mockElement = createMockElement('DIV', { tabindex: '5' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([mockElement] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.mediumCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('positive tabindex')
      )).toBe(true);
    });

    it('should detect non-keyboard accessible clickable elements', async () => {
      const mockDiv = createMockElement('DIV', { onclick: 'click()' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([mockDiv] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.highCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('not keyboard accessible')
      )).toBe(true);
    });
  });

  describe('focus indicators analysis', () => {
    it('should detect missing focus indicators', async () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([mockButton] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      mockGetComputedStyle.mockReturnValue({
        outline: 'none',
        outlineWidth: '0px',
        outlineStyle: 'none',
        boxShadow: 'none',
        border: 'none'
      });

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.mediumCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('focus indicators')
      )).toBe(true);
    });

    it('should not flag elements with proper focus styles', async () => {
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce(null as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([] as any)
        .mockReturnValueOnce([mockButton] as any);

      mockGetComputedStyle.mockReturnValue({
        outline: '2px solid blue',
        outlineWidth: '2px',
        outlineStyle: 'solid',
        boxShadow: 'none',
        border: 'none'
      });

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      // Should not report focus indicator issues
      const focusIssues = result.pageResults['/test'].issues.filter(issue => 
        issue.includes('focus indicators')
      );
      expect(focusIssues).toHaveLength(0);
    });
  });

  describe('alt text analysis', () => {
    it('should detect missing alt attributes', async () => {
      const mockImg = createMockElement('IMG', { alt: null, src: 'test.jpg' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([mockImg] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.highCount).toBeGreaterThan(0);
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('images missing alt')
      )).toBe(true);
    });

    it('should detect poor alt text patterns', async () => {
      const mockImg = createMockElement('IMG', { alt: 'image', src: 'content.jpg' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([mockImg] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('generic/unhelpful alt text')
      )).toBe(true);
    });

    it('should warn about very long alt text', async () => {
      const longAlt = 'a'.repeat(150); // 150 characters
      const mockImg = createMockElement('IMG', { alt: longAlt, src: 'test.jpg' });
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements for contrast
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce([] as any) // focusable elements for keyboard nav
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focusable elements for focus indicators
        .mockReturnValueOnce([mockImg] as any) // images
        .mockReturnValueOnce([] as any) // background images
        .mockReturnValueOnce([] as any); // clickable divs for semantic
      
      vi.spyOn(document, 'querySelector').mockReturnValue(null as any); // main landmark

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.pageResults['/test'].issues.some(issue => 
        issue.includes('alt text very long')
      )).toBe(true);
    });
  });

  describe('overall scoring and reporting', () => {
    it('should calculate overall score across pages', async () => {
      const config = { pages: ['/page1', '/page2', '/page3'] };
      const scanner = new AccessibilityScanner(config);
      
      // Mock clean pages with no issues
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      vi.spyOn(document, 'querySelector').mockReturnValue(createMockElement('H1') as any);
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const result = await scanner.scanAllPages();
      
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(10);
      expect(result.pageResults).toHaveProperty('/page1');
      expect(result.pageResults).toHaveProperty('/page2');
      expect(result.pageResults).toHaveProperty('/page3');
    });

    it('should provide detailed issue summary', async () => {
      // Mock some issues
      const mockImg = createMockElement('IMG', { alt: null });
      const mockButton = createMockElement('BUTTON');
      vi.spyOn(document, 'querySelectorAll')
        .mockReturnValueOnce([] as any) // text elements
        .mockReturnValueOnce([] as any) // inputs
        .mockReturnValueOnce([mockButton] as any) // buttons
        .mockReturnValueOnce([] as any) // links
        .mockReturnValueOnce([] as any) // headings
        .mockReturnValueOnce(null as any) // main
        .mockReturnValueOnce([] as any) // clickable divs
        .mockReturnValueOnce([] as any) // focusable elements
        .mockReturnValueOnce([] as any) // clickable elements
        .mockReturnValueOnce([] as any) // focus indicators
        .mockReturnValueOnce([mockImg] as any); // images

      const scanner = new AccessibilityScanner({ pages: ['/test'] });
      const result = await scanner.scanAllPages();
      
      expect(result.summary.totalIssues).toBeGreaterThan(0);
      expect(typeof result.summary.criticalCount).toBe('number');
      expect(typeof result.summary.highCount).toBe('number');
      expect(typeof result.summary.mediumCount).toBe('number');
      expect(typeof result.summary.lowCount).toBe('number');
      
      expect(
        result.summary.criticalCount + 
        result.summary.highCount + 
        result.summary.mediumCount + 
        result.summary.lowCount
      ).toBe(result.summary.totalIssues);
    });

    it('should include page-specific information in critical issues', async () => {
      const mockElement = createMockElement('P');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement] as any);
      
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal'
      });

      const scanner = new AccessibilityScanner({ pages: ['/critical-page'] });
      const result = await scanner.scanAllPages();
      
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.criticalIssues[0].page).toBe('/critical-page');
      expect(result.criticalIssues[0].severity).toBe('critical');
    });
  });

  describe('runAccessibilityAudit helper function', () => {
    it('should use default config when none provided', async () => {
      // Mock minimal DOM to avoid errors
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      vi.spyOn(document, 'querySelector').mockReturnValue(createMockElement('H1') as any);

      const result = await runAccessibilityAudit();
      
      expect(result).toHaveProperty('pageResults');
      expect(result).toHaveProperty('overallScore');
      expect(Object.keys(result.pageResults)).toEqual(DEFAULT_SCAN_CONFIG.pages);
    });

    it('should accept custom config', async () => {
      const customConfig = { pages: ['/custom'] };
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      vi.spyOn(document, 'querySelector').mockReturnValue(createMockElement('H1') as any);

      const result = await runAccessibilityAudit(customConfig);
      
      expect(Object.keys(result.pageResults)).toEqual(['/custom']);
    });
  });
});