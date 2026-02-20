import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  analyzeTouchTargets,
  analyzeResponsiveness,
  analyzeHorizontalScroll,
  analyzeFontSizes,
  analyzeMobileInteractions,
  auditMobileUX
} from '../mobile-ux';

describe('Mobile UX Audit', () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    
    // Mock window object
    global.window = {
      innerWidth: 375, // iPhone viewport width
      getComputedStyle: vi.fn()
    } as any;

    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('analyzeTouchTargets', () => {
    it('should identify touch targets smaller than 44px', () => {
      // Mock small button (30x30px)
      const smallButton = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ width: 30, height: 30 })
      };
      
      // Mock large button (48x48px)
      const largeButton = {
        tagName: 'BUTTON', 
        getBoundingClientRect: () => ({ width: 48, height: 48 })
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([smallButton, largeButton])
      } as any;

      const issues = analyzeTouchTargets();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'touch-targets',
        severity: 'high',
        element: 'button',
        description: 'Touch target is 30x30px (below 44x44px minimum)',
        recommendation: 'Increase touch target size to at least 44x44px with padding or min-width/height'
      });
    });

    it('should handle elements with width but not height below threshold', () => {
      const wideButton = {
        tagName: 'A',
        getBoundingClientRect: () => ({ width: 100, height: 20 })
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([wideButton])
      } as any;

      const issues = analyzeTouchTargets();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].description).toContain('100x20px');
    });

    it('should not flag elements that meet minimum size requirements', () => {
      const properButton = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ width: 44, height: 44 })
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([properButton])
      } as any;

      const issues = analyzeTouchTargets();
      expect(issues).toHaveLength(0);
    });

    it('should return empty array when window is not available', () => {
      global.window = undefined as any;
      
      const issues = analyzeTouchTargets();
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeResponsiveness', () => {
    it('should detect missing viewport meta tag', () => {
      global.document = {
        querySelector: vi.fn().mockReturnValue(null),
        querySelectorAll: vi.fn().mockReturnValue([])
      } as any;

      const issues = analyzeResponsiveness();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'responsive',
        severity: 'critical',
        description: 'Missing or incorrect viewport meta tag',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>'
      });
    });

    it('should detect incorrect viewport meta tag', () => {
      const incorrectViewport = {
        getAttribute: () => 'width=1024'
      };

      global.document = {
        querySelector: vi.fn().mockReturnValue(incorrectViewport),
        querySelectorAll: vi.fn().mockReturnValue([])
      } as any;

      const issues = analyzeResponsiveness();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('critical');
    });

    it('should detect elements with fixed widths larger than mobile viewport', () => {
      const mockViewport = {
        getAttribute: () => 'width=device-width, initial-scale=1'
      };

      const wideElement = {
        tagName: 'DIV'
      };

      global.document = {
        querySelector: vi.fn().mockReturnValue(mockViewport),
        querySelectorAll: vi.fn().mockReturnValue([wideElement])
      } as any;

      global.window.getComputedStyle = vi.fn().mockReturnValue({
        width: '500px'
      });

      const issues = analyzeResponsiveness();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'responsive',
        severity: 'medium',
        element: 'div',
        description: 'Element has fixed width of 500px (may cause horizontal scroll on mobile)',
        recommendation: 'Use responsive units (%, vw, rem) or max-width instead of fixed widths'
      });
    });

    it('should not flag responsive elements', () => {
      const mockViewport = {
        getAttribute: () => 'width=device-width, initial-scale=1'
      };

      const responsiveElement = {
        tagName: 'DIV'
      };

      global.document = {
        querySelector: vi.fn().mockReturnValue(mockViewport),
        querySelectorAll: vi.fn().mockReturnValue([responsiveElement])
      } as any;

      global.window.getComputedStyle = vi.fn().mockReturnValue({
        width: '100%'
      });

      const issues = analyzeResponsiveness();
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeHorizontalScroll', () => {
    it('should detect when page content exceeds viewport width', () => {
      global.window.innerWidth = 375;
      global.document = {
        body: { scrollWidth: 500 },
        querySelectorAll: vi.fn().mockReturnValue([])
      } as any;

      const issues = analyzeHorizontalScroll();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'horizontal-scroll',
        severity: 'high',
        description: 'Page content (500px) exceeds viewport width (375px)',
        recommendation: 'Ensure all content fits within viewport width using responsive design'
      });
    });

    it('should detect elements extending beyond viewport', () => {
      global.window.innerWidth = 375;
      global.document = {
        body: { scrollWidth: 375 },
        querySelectorAll: vi.fn().mockReturnValue([
          {
            tagName: 'DIV',
            getBoundingClientRect: () => ({ right: 400 })
          }
        ])
      } as any;

      const issues = analyzeHorizontalScroll();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'horizontal-scroll',
        severity: 'medium',
        element: 'div',
        description: 'Element extends beyond right edge of viewport',
        recommendation: 'Use responsive layout or overflow handling to prevent horizontal scroll'
      });
    });

    it('should not flag content that fits within viewport', () => {
      global.window.innerWidth = 375;
      global.document = {
        body: { scrollWidth: 375 },
        querySelectorAll: vi.fn().mockReturnValue([
          {
            tagName: 'DIV',
            getBoundingClientRect: () => ({ right: 300 })
          }
        ])
      } as any;

      const issues = analyzeHorizontalScroll();
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeFontSizes', () => {
    it('should identify text smaller than 16px', () => {
      const smallTextElement = {
        tagName: 'P',
        textContent: 'This is small text'
      };

      const largeTextElement = {
        tagName: 'P', 
        textContent: 'This is large text'
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([smallTextElement, largeTextElement])
      } as any;

      global.window.getComputedStyle = vi.fn()
        .mockReturnValueOnce({ fontSize: '12px' })
        .mockReturnValueOnce({ fontSize: '18px' });

      const issues = analyzeFontSizes();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'font-size',
        severity: 'medium',
        element: 'p',
        description: 'Text size is 12px (below 16px minimum for mobile readability)',
        recommendation: 'Increase font size to at least 16px for body text on mobile devices'
      });
    });

    it('should not flag empty elements', () => {
      const emptyElement = {
        tagName: 'DIV',
        textContent: '   '
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([emptyElement])
      } as any;

      global.window.getComputedStyle = vi.fn().mockReturnValue({ fontSize: '10px' });

      const issues = analyzeFontSizes();
      expect(issues).toHaveLength(0);
    });

    it('should handle elements with proper font sizes', () => {
      const properTextElement = {
        tagName: 'P',
        textContent: 'This text meets requirements'
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([properTextElement])
      } as any;

      global.window.getComputedStyle = vi.fn().mockReturnValue({ fontSize: '16px' });

      const issues = analyzeFontSizes();
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeMobileInteractions', () => {
    it('should detect hover-only interactions', () => {
      const hoverElement = {
        tagName: 'DIV'
      };

      global.document = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([hoverElement]) // For hover elements
          .mockReturnValueOnce([]) // For clickable elements
      } as any;

      const issues = analyzeMobileInteractions();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'responsive',
        severity: 'low',
        element: 'div',
        description: 'Element may rely on hover interactions not available on mobile',
        recommendation: 'Ensure interactive elements work with touch and provide touch-friendly alternatives'
      });
    });

    it('should detect clickable elements that are too close together', () => {
      const button1 = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ bottom: 100 })
      };
      
      const button2 = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ top: 104 }) // 4px gap
      };

      global.document = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([]) // For hover elements
          .mockReturnValueOnce([button1, button2]) // For clickable elements
      } as any;

      const issues = analyzeMobileInteractions();
      
      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        type: 'touch-targets',
        severity: 'medium',
        description: 'Clickable elements are too close together (4px spacing)',
        recommendation: 'Add more spacing between interactive elements to prevent accidental taps'
      });
    });

    it('should not flag properly spaced elements', () => {
      const button1 = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ bottom: 100 })
      };
      
      const button2 = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ top: 120 }) // 20px gap
      };

      global.document = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([]) // For hover elements
          .mockReturnValueOnce([button1, button2]) // For clickable elements
      } as any;

      const issues = analyzeMobileInteractions();
      expect(issues).toHaveLength(0);
    });
  });

  describe('auditMobileUX', () => {
    beforeEach(() => {
      // Setup default mocks for a clean audit
      global.document = {
        querySelector: vi.fn().mockReturnValue({
          getAttribute: () => 'width=device-width, initial-scale=1'
        }),
        querySelectorAll: vi.fn().mockReturnValue([]),
        body: { scrollWidth: 375 }
      } as any;
      
      global.window = {
        innerWidth: 375,
        getComputedStyle: vi.fn().mockReturnValue({
          width: '100%',
          fontSize: '16px'
        })
      } as any;
    });

    it('should return a complete mobile UX audit score', () => {
      const result = auditMobileUX();
      
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should calculate score based on issue severity', () => {
      // Mock critical issue (missing viewport)
      global.document.querySelector = vi.fn().mockReturnValue(null);
      
      const result = auditMobileUX();
      
      // Should have lower score due to critical issue
      expect(result.score).toBeLessThan(10);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.includes('CRITICAL:'))).toBe(true);
    });

    it('should include mobile UX recommendations', () => {
      const result = auditMobileUX();
      
      expect(result.recommendations).toContain('Test on real mobile devices across different screen sizes');
      expect(result.recommendations).toContain('Ensure all touch targets are at least 44x44px');
      expect(result.recommendations).toContain('Verify no horizontal scrolling occurs on mobile viewports');
      expect(result.recommendations).toContain('Use minimum 16px font size for body text');
      expect(result.recommendations).toContain('Test navigation and interactions with touch input');
    });

    it('should weight critical issues heavily in scoring', () => {
      // Mock multiple critical issues
      global.document.querySelector = vi.fn().mockReturnValue(null); // Missing viewport
      global.document.body.scrollWidth = 500; // Horizontal scroll
      
      const result = auditMobileUX();
      
      expect(result.score).toBeLessThanOrEqual(5); // Should be significantly impacted
    });

    it('should handle perfect mobile UX with high score', () => {
      // All good conditions
      const result = auditMobileUX();
      
      expect(result.score).toBeGreaterThan(8);
      expect(result.issues).toHaveLength(0);
    });

    it('should return score between 1 and 10', () => {
      // Mock many critical issues to test score clamping
      global.document.querySelector = vi.fn().mockReturnValue(null);
      global.document.body.scrollWidth = 600;
      global.document.querySelectorAll = vi.fn((selector) => {
        if (selector.includes('button, a,')) {
          return Array(10).fill({
            tagName: 'BUTTON',
            getBoundingClientRect: () => ({ width: 20, height: 20 })
          });
        }
        if (selector.includes('p, span,')) {
          return Array(10).fill({
            tagName: 'P',
            textContent: 'Small text'
          });
        }
        return [];
      });
      
      global.window.getComputedStyle = vi.fn().mockReturnValue({
        width: '600px',
        fontSize: '10px'
      });

      const result = auditMobileUX();
      
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
    });
  });

  describe('Cross-breakpoint testing simulation', () => {
    it('should handle different viewport sizes', () => {
      const testViewports = [
        { width: 320, name: 'Mobile Small' },
        { width: 375, name: 'Mobile Medium' },
        { width: 768, name: 'Tablet' },
        { width: 1024, name: 'Desktop' }
      ];

      testViewports.forEach(viewport => {
        global.window.innerWidth = viewport.width;
        global.document = {
          querySelector: vi.fn().mockReturnValue({
            getAttribute: () => 'width=device-width, initial-scale=1'
          }),
          querySelectorAll: vi.fn().mockReturnValue([]),
          body: { scrollWidth: viewport.width }
        } as any;

        const result = auditMobileUX();
        expect(result.score).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle getBoundingClientRect returning zero dimensions', () => {
      const zeroButton = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ width: 0, height: 0 })
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([zeroButton])
      } as any;

      const issues = analyzeTouchTargets();
      
      expect(issues).toHaveLength(1);
      expect(issues[0].description).toContain('0x0px');
    });

    it('should handle non-numeric font sizes gracefully', () => {
      const textElement = {
        tagName: 'P',
        textContent: 'Text content'
      };

      global.document = {
        querySelectorAll: vi.fn().mockReturnValue([textElement])
      } as any;

      global.window.getComputedStyle = vi.fn().mockReturnValue({
        fontSize: 'inherit'
      });

      const issues = analyzeFontSizes();
      
      // Should handle gracefully - parseFloat('inherit') returns NaN, NaN < 16 is false, so no issues
      expect(issues).toHaveLength(0);
    });

    it('should handle missing window object', () => {
      global.window = undefined as any;
      
      expect(() => {
        auditMobileUX();
      }).not.toThrow();
      
      const result = auditMobileUX();
      expect(result.score).toBe(10); // Should default to perfect score when can't audit
      expect(result.issues).toHaveLength(0);
    });
  });
});