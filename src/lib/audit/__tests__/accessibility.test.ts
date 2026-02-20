import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeColorContrast, analyzeARIA, analyzeKeyboardNavigation, auditAccessibility } from '../accessibility';

// Mock DOM environment
const mockElement = {
  tagName: 'BUTTON',
  getAttribute: vi.fn(),
  textContent: 'Click me'
} as unknown as HTMLElement;

const mockImage = {
  tagName: 'IMG',
  getAttribute: vi.fn().mockReturnValue(null)
} as unknown as HTMLElement;

// Mock window.getComputedStyle
const mockGetComputedStyle = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
    writable: true
  });
});

describe('accessibility audit', () => {
  describe('analyzeColorContrast', () => {
    it('should detect same color for text and background', () => {
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)'
      });

      const issues = analyzeColorContrast(mockElement);
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'contrast',
        severity: 'critical',
        element: 'button',
        description: 'Text and background have the same color',
        recommendation: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)'
      });
    });

    it('should not report issues for different colors', () => {
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)'
      });

      const issues = analyzeColorContrast(mockElement);
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeARIA', () => {
    it('should detect missing alt text on images', () => {
      const issues = analyzeARIA(mockImage);
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'alt-text',
        severity: 'high',
        element: 'img',
        description: 'Image missing alt attribute',
        recommendation: 'Add descriptive alt text or alt="" for decorative images'
      });
    });

    it('should detect interactive elements without accessible names', () => {
      const buttonElement = {
        tagName: 'BUTTON',
        getAttribute: vi.fn().mockReturnValue(null),
        textContent: ''
      } as unknown as HTMLElement;

      const issues = analyzeARIA(buttonElement);
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'aria',
        severity: 'high',
        element: 'button',
        description: 'Interactive element lacks accessible name',
        recommendation: 'Add aria-label, aria-labelledby, or visible text content'
      });
    });

    it('should not report issues for properly labeled elements', () => {
      const labeledButton = {
        tagName: 'BUTTON',
        getAttribute: vi.fn().mockReturnValue('Click to submit'),
        textContent: 'Submit'
      } as unknown as HTMLElement;

      const issues = analyzeARIA(labeledButton);
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeKeyboardNavigation', () => {
    it('should detect focusable elements without focus indicators', () => {
      // Mock document.querySelectorAll
      const mockElements = [mockElement];
      vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('none'),
        outline: 'none',
        boxShadow: '',
        border: ''
      });

      const issues = analyzeKeyboardNavigation();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('focus-indicators');
      expect(issues[0].severity).toBe('medium');
    });
  });

  describe('auditAccessibility', () => {
    it('should calculate score based on issues severity', () => {
      // Mock DOM queries to return empty results for clean test
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      mockGetComputedStyle.mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        getPropertyValue: vi.fn().mockReturnValue('2px solid blue')
      });

      const result = auditAccessibility();
      
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should include general recommendations', () => {
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('none')
      });

      const result = auditAccessibility();
      
      expect(result.recommendations).toContain('Run automated accessibility testing with axe-core');
      expect(result.recommendations).toContain('Test with screen readers');
    });
  });
});