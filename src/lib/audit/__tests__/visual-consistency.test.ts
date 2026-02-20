import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractSpacingValues,
  extractTypographyValues,
  extractColorValues,
  analyzeSpacing,
  analyzeTypography,
  analyzeColorPalette,
  analyzeLayout,
  analyzeDesignPatterns,
  auditVisualConsistency,
  getVisualConsistencyData
} from '../visual-consistency';

// Mock DOM environment
const mockWindow = {
  getComputedStyle: vi.fn()
};

const mockDocument = {
  querySelectorAll: vi.fn()
};

describe('Visual Consistency Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.window = mockWindow;
    // @ts-ignore  
    global.document = mockDocument;
  });

  describe('extractSpacingValues', () => {
    it('should extract spacing values from elements', () => {
      const mockElements = [
        { tagName: 'div' },
        { tagName: 'p' }
      ];
      
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle
        .mockReturnValueOnce({
          getPropertyValue: vi.fn()
            .mockReturnValueOnce('16') // margin-top
            .mockReturnValueOnce('8')  // margin-right  
            .mockReturnValueOnce('16') // margin-bottom
            .mockReturnValueOnce('8')  // margin-left
            .mockReturnValueOnce('12') // padding-top
            .mockReturnValueOnce('12') // padding-right
            .mockReturnValueOnce('12') // padding-bottom
            .mockReturnValueOnce('12') // padding-left
        })
        .mockReturnValueOnce({
          getPropertyValue: vi.fn()
            .mockReturnValueOnce('24') // margin-top
            .mockReturnValueOnce('0')  // margin-right
            .mockReturnValueOnce('24') // margin-bottom
            .mockReturnValueOnce('0')  // margin-left
            .mockReturnValueOnce('16') // padding-top
            .mockReturnValueOnce('16') // padding-right
            .mockReturnValueOnce('16') // padding-bottom
            .mockReturnValueOnce('16') // padding-left
        });

      const result = extractSpacingValues();

      expect(result.margins).toHaveLength(8);
      expect(result.paddings).toHaveLength(8);
      expect(result.uniqueMargins.has(16)).toBe(true);
      expect(result.uniqueMargins.has(8)).toBe(true);
      expect(result.uniqueMargins.has(24)).toBe(true);
      expect(result.uniquePaddings.has(12)).toBe(true);
      expect(result.uniquePaddings.has(16)).toBe(true);
    });

    it('should handle invalid spacing values', () => {
      const mockElements = [{ tagName: 'div' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn()
          .mockReturnValue('invalid') // All properties return invalid
      });

      const result = extractSpacingValues();

      expect(result.margins).toHaveLength(0);
      expect(result.paddings).toHaveLength(0);
      expect(result.uniqueMargins.size).toBe(0);
      expect(result.uniquePaddings.size).toBe(0);
    });

    it('should handle negative spacing values', () => {
      const mockElements = [{ tagName: 'div' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn()
          .mockReturnValueOnce('-16') // negative margin
          .mockReturnValueOnce('8')
          .mockReturnValueOnce('0')
          .mockReturnValueOnce('0')
          .mockReturnValueOnce('12')
          .mockReturnValueOnce('12')
          .mockReturnValueOnce('12')
          .mockReturnValueOnce('12')
      });

      const result = extractSpacingValues();

      expect(result.uniqueMargins.has(8)).toBe(true);
      expect(result.uniqueMargins.has(0)).toBe(true);
      expect(result.uniqueMargins.has(-16)).toBe(false); // Negative values should be excluded
    });
  });

  describe('extractTypographyValues', () => {
    it('should extract typography values from text elements', () => {
      const mockElements = [
        { tagName: 'h1' },
        { tagName: 'p' }
      ];
      
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle
        .mockReturnValueOnce({
          fontSize: '32px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.2'
        })
        .mockReturnValueOnce({
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.5'
        });

      const result = extractTypographyValues();

      expect(result.uniqueFontSizes.has(32)).toBe(true);
      expect(result.uniqueFontSizes.has(16)).toBe(true);
      expect(result.uniqueFontFamilies.has('Arial, sans-serif')).toBe(true);
      expect(result.uniqueLineHeights.has(1.2)).toBe(true);
      expect(result.uniqueLineHeights.has(1.5)).toBe(true);
    });

    it('should handle normal line height', () => {
      const mockElements = [{ tagName: 'p' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 'normal'
      });

      const result = extractTypographyValues();

      expect(result.uniqueLineHeights.size).toBe(0); // normal line heights are excluded
    });

    it('should handle percentage line heights', () => {
      const mockElements = [{ tagName: 'p' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '150%'
      });

      const result = extractTypographyValues();

      expect(result.uniqueLineHeights.size).toBe(0); // percentage line heights are excluded
    });

    it('should handle invalid font sizes', () => {
      const mockElements = [{ tagName: 'p' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        fontSize: 'invalid',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5'
      });

      const result = extractTypographyValues();

      expect(result.uniqueFontSizes.size).toBe(0);
    });
  });

  describe('extractColorValues', () => {
    it('should extract color values and convert to hex/hsl', () => {
      const mockElements = [
        { tagName: 'div' },
        { tagName: 'p' }
      ];
      
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle
        .mockReturnValueOnce({
          color: 'rgb(255, 0, 0)',
          backgroundColor: 'rgb(255, 255, 255)',
          borderColor: 'rgb(0, 0, 255)'
        })
        .mockReturnValueOnce({
          color: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'transparent'
        });

      const result = extractColorValues();

      expect(result.textColors).toContain('rgb(255, 0, 0)');
      expect(result.textColors).toContain('#000000');
      expect(result.backgroundColors).toContain('rgb(255, 255, 255)');
      expect(result.hexColors).toContain('#ff0000');
      expect(result.hexColors).toContain('#ffffff');
      expect(result.hexColors).toContain('#0000ff');
      expect(result.hexColors).toContain('#000000');
    });

    it('should handle transparent and zero alpha colors', () => {
      const mockElements = [{ tagName: 'div' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
        borderColor: 'currentcolor'
      });

      const result = extractColorValues();

      expect(result.textColors).toHaveLength(0);
      expect(result.backgroundColors).toHaveLength(0);
      expect(result.borderColors).toHaveLength(0);
    });

    it('should handle HSL colors', () => {
      const mockElements = [{ tagName: 'div' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        color: 'hsl(240, 100%, 50%)',
        backgroundColor: 'transparent',
        borderColor: 'transparent'
      });

      const result = extractColorValues();

      expect(result.hslColors).toContain('hsl(240, 100%, 50%)');
    });
  });

  describe('analyzeSpacing', () => {
    it('should identify too many spacing values', () => {
      const mockElements = new Array(15).fill({ tagName: 'div' });
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      // Mock different spacing values for each element
      mockWindow.getComputedStyle.mockImplementation(() => ({
        getPropertyValue: vi.fn()
          .mockReturnValueOnce(Math.random() * 100 + '') // Random margin values
          .mockReturnValueOnce(Math.random() * 100 + '')
          .mockReturnValueOnce(Math.random() * 100 + '')
          .mockReturnValueOnce(Math.random() * 100 + '')
          .mockReturnValueOnce(Math.random() * 50 + '') // Random padding values
          .mockReturnValueOnce(Math.random() * 50 + '')
          .mockReturnValueOnce(Math.random() * 50 + '')
          .mockReturnValueOnce(Math.random() * 50 + '')
      }));

      const issues = analyzeSpacing();

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.type === 'spacing' && issue.description.includes('margin values'))).toBe(true);
    });

    it('should identify fractional spacing values', () => {
      const mockElements = [
        { tagName: 'div' },
        { tagName: 'p' },
        { tagName: 'span' }
      ];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockImplementation(() => ({
        getPropertyValue: vi.fn()
          .mockReturnValueOnce('16.5') // Fractional margin
          .mockReturnValueOnce('8.7')
          .mockReturnValueOnce('24.3')
          .mockReturnValueOnce('12.1')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
      }));

      const issues = analyzeSpacing();

      expect(issues.some(issue => 
        issue.description.includes('fractional margin values')
      )).toBe(true);
    });

    it('should not report issues for consistent spacing', () => {
      const mockElements = [
        { tagName: 'div' },
        { tagName: 'p' }
      ];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockImplementation(() => ({
        getPropertyValue: vi.fn()
          .mockReturnValueOnce('16') // Consistent spacing values
          .mockReturnValueOnce('8')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('8')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
          .mockReturnValueOnce('16')
      }));

      const issues = analyzeSpacing();

      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeTypography', () => {
    it('should identify too many font sizes', () => {
      const mockElements = new Array(12).fill(null).map((_, i) => ({ tagName: 'p' }));
      mockDocument.querySelectorAll.mockReturnValueOnce(mockElements); // text elements
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // headings
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => ({
        fontSize: `${12 + callIndex++ * 2}px`, // Ensure each call gets unique font size: 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5'
      }));

      const issues = analyzeTypography();

      expect(issues.some(issue => 
        issue.description.includes('different font sizes')
      )).toBe(true);
    });

    it('should identify too many font families', () => {
      const mockElements = [
        { tagName: 'h1' },
        { tagName: 'p' },
        { tagName: 'span' },
        { tagName: 'div' },
        { tagName: 'a' }
      ];
      mockDocument.querySelectorAll.mockReturnValueOnce(mockElements); // text elements
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // headings
      
      const fontFamilies = [
        'Arial, sans-serif',
        'Georgia, serif',  
        'Times, serif',
        'Helvetica, sans-serif',
        'Courier, monospace'
      ];
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => ({
        fontSize: '16px',
        fontFamily: fontFamilies[callIndex++ % fontFamilies.length],
        lineHeight: '1.5'
      }));

      const issues = analyzeTypography();

      expect(issues.some(issue => 
        issue.description.includes('different font families')
      )).toBe(true);
    });

    it('should identify heading hierarchy issues', () => {
      const mockHeadings = [
        { tagName: 'H1' },
        { tagName: 'H3' }, // Missing H2
        { tagName: 'H4' }
      ];
      
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // Text elements query
      mockDocument.querySelectorAll.mockReturnValueOnce(mockHeadings); // Headings query

      mockWindow.getComputedStyle.mockReturnValue({
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif', 
        lineHeight: '1.5'
      });

      const issues = analyzeTypography();

      expect(issues.some(issue => 
        issue.description.includes('hierarchy has')
      )).toBe(true);
    });

    it('should not report issues for good typography', () => {
      const mockElements = [
        { tagName: 'h1' },
        { tagName: 'p' }
      ];
      mockDocument.querySelectorAll.mockReturnValueOnce(mockElements); // Text elements
      mockDocument.querySelectorAll.mockReturnValueOnce([
        { tagName: 'H1' },
        { tagName: 'H2' }
      ]); // Headings

      mockWindow.getComputedStyle.mockImplementation(() => ({
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5'
      }));

      const issues = analyzeTypography();

      expect(issues.filter(issue => issue.severity === 'high' || issue.severity === 'critical')).toHaveLength(0);
    });
  });

  describe('analyzeColorPalette', () => {
    it('should identify too many colors', () => {
      const mockElements = new Array(15).fill(null).map((_, i) => ({ tagName: 'div' }));
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const index = callIndex++;
        return {
          color: `rgb(${(index * 17) % 255}, ${(index * 23) % 255}, ${(index * 29) % 255})`,
          backgroundColor: `rgb(${255 - (index * 13) % 255}, ${255 - (index * 19) % 255}, ${255 - (index * 31) % 255})`,
          borderColor: 'transparent'
        };
      });

      const issues = analyzeColorPalette();

      expect(issues.some(issue => 
        issue.description.includes('different text colors')
      )).toBe(true);
    });

    it('should identify similar but not identical colors', () => {
      const mockElements = [
        { tagName: 'div' },
        { tagName: 'p' },
        { tagName: 'span' },
        { tagName: 'a' }
      ];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle
        .mockReturnValueOnce({
          color: 'rgb(255, 0, 0)',
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        })
        .mockReturnValueOnce({
          color: 'rgb(250, 5, 5)', // Similar to first color
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        })
        .mockReturnValueOnce({
          color: 'rgb(245, 10, 10)', // Similar to first color
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        })
        .mockReturnValueOnce({
          color: 'rgb(240, 15, 15)', // Similar to first color
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        });

      const issues = analyzeColorPalette();

      expect(issues.some(issue => 
        issue.description.includes('similar but not identical colors')
      )).toBe(true);
    });

    it('should handle no colors gracefully', () => {
      const mockElements = [{ tagName: 'div' }];
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      mockWindow.getComputedStyle.mockReturnValue({
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
        borderColor: 'transparent'
      });

      const issues = analyzeColorPalette();

      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeDesignPatterns', () => {
    it('should identify inconsistent button styles', () => {
      const mockButtons = new Array(6).fill(null).map(() => ({ tagName: 'button' }));
      mockDocument.querySelectorAll.mockReturnValueOnce(mockButtons); // buttons
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // inputs
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // cards
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const index = callIndex++;
        return {
          backgroundColor: `rgb(${index * 40}, ${index * 30}, ${index * 20})`,
          color: index % 2 ? 'white' : 'black',
          border: `${index + 1}px solid rgb(${index * 40}, ${index * 30}, ${index * 20})`,
          borderRadius: `${4 + index * 2}px`,
          padding: `${8 + index}px ${16 + index * 2}px`
        };
      });

      const issues = analyzeDesignPatterns();

      expect(issues.some(issue => 
        issue.description.includes('button style combinations')
      )).toBe(true);
    });

    it('should identify inconsistent form input styles', () => {
      const mockInputs = [
        { tagName: 'input' },
        { tagName: 'textarea' },
        { tagName: 'select' }
      ];
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // buttons
      mockDocument.querySelectorAll.mockReturnValueOnce(mockInputs); // inputs
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // cards
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const styles = [
          { border: '1px solid red', padding: '8px' },
          { border: '2px dashed blue', padding: '12px' },
          { border: '3px dotted green', padding: '16px' }
        ];
        return styles[callIndex++ % styles.length];
      });

      const issues = analyzeDesignPatterns();

      expect(issues.some(issue => 
        issue.description.includes('border styles for form inputs')
      )).toBe(true);
    });

    it('should identify inconsistent card shadows', () => {
      const mockCards = [
        { tagName: 'div' },
        { tagName: 'div' },
        { tagName: 'div' },
        { tagName: 'div' },
        { tagName: 'div' }
      ];
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // buttons
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // inputs
      mockDocument.querySelectorAll.mockReturnValueOnce(mockCards); // cards
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const shadows = [
          '0 1px 2px rgba(0,0,0,0.1)',
          '0 2px 4px rgba(0,0,0,0.2)',
          '0 4px 8px rgba(0,0,0,0.3)',
          '0 8px 16px rgba(0,0,0,0.4)',
          '0 16px 32px rgba(0,0,0,0.5)'
        ];
        return {
          boxShadow: shadows[callIndex++ % shadows.length],
          border: '0px none rgb(0, 0, 0)',
          borderRadius: '4px'
        };
      });

      const issues = analyzeDesignPatterns();

      expect(issues.some(issue => 
        issue.description.includes('box-shadow styles')
      )).toBe(true);
    });
  });

  describe('analyzeLayout', () => {
    it('should identify too many container widths', () => {
      const mockContainers = new Array(6).fill(null).map(() => ({ tagName: 'div' }));
      mockDocument.querySelectorAll.mockReturnValueOnce(mockContainers); // containers
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // layout elements (separate call)
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // buttons (from analyzeDesignPatterns)
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // inputs (from analyzeDesignPatterns) 
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // cards (from analyzeDesignPatterns)
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const widths = ['320px', '480px', '640px', '768px', '1024px', '1280px'];
        return {
          maxWidth: widths[callIndex++ % widths.length],
          width: 'auto',
          display: 'block',
          float: 'none'
        };
      });

      const issues = analyzeLayout();

      expect(issues.some(issue => 
        issue.description.includes('max-width values')
      )).toBe(true);
    });

    it('should identify mixed layout methods', () => {
      const mockElements = new Array(12).fill(null).map(() => ({ tagName: 'div' }));
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // containers (no max-width issues)
      mockDocument.querySelectorAll.mockReturnValueOnce(mockElements); // layout elements
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // buttons (from analyzeDesignPatterns)
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // inputs (from analyzeDesignPatterns)
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // cards (from analyzeDesignPatterns)
      
      let callIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const styles = [
          { maxWidth: 'none', width: 'auto', display: 'grid', float: 'none' },
          { maxWidth: 'none', width: 'auto', display: 'flex', float: 'none' }
        ];
        return styles[callIndex++ % 2];
      });

      const issues = analyzeLayout();

      expect(issues.some(issue => 
        issue.description.includes('Both CSS Grid') && issue.description.includes('Flexbox')
      )).toBe(true);
    });

    it('should identify float usage', () => {
      const mockElements = new Array(5).fill({ tagName: 'div' });
      mockDocument.querySelectorAll.mockReturnValueOnce([]); // containers
      mockDocument.querySelectorAll.mockReturnValueOnce(mockElements); // layout elements
      
      mockWindow.getComputedStyle.mockReturnValue({
        maxWidth: 'none',
        width: 'auto',
        display: 'block',
        float: 'left'
      });

      const issues = analyzeLayout();

      expect(issues.some(issue => 
        issue.description.includes('elements using CSS float')
      )).toBe(true);
    });
  });

  describe('auditVisualConsistency', () => {
    beforeEach(() => {
      // Setup minimal DOM mocks for full audit
      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('h1, h2, h3, h4, h5, h6')) {
          return [{ tagName: 'H1' }, { tagName: 'H2' }];
        }
        if (selector === 'h1, h2, h3, h4, h5, h6') {
          return [{ tagName: 'H1' }, { tagName: 'H2' }];
        }
        if (selector.includes('button')) {
          return [{ tagName: 'button' }];
        }
        return [{ tagName: 'div' }, { tagName: 'p' }];
      });

      mockWindow.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('16'),
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5',
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        borderColor: 'transparent',
        maxWidth: 'none',
        width: 'auto',
        display: 'block',
        float: 'none',
        border: '1px solid gray',
        borderRadius: '4px',
        padding: '8px 16px',
        boxShadow: 'none'
      });
    });

    it('should return a valid audit score', () => {
      const result = auditVisualConsistency();

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should calculate score based on issue severity', () => {
      // Mock high-severity issues with specific selectors
      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('h1, h2, h3, h4, h5, h6')) {
          return new Array(20).fill(null).map((_, i) => ({ tagName: 'div' }));
        }
        if (selector === 'h1, h2, h3, h4, h5, h6') {
          return [{ tagName: 'H1' }, { tagName: 'H3' }]; // Bad hierarchy
        }
        if (selector.includes('button')) {
          return new Array(8).fill(null).map(() => ({ tagName: 'button' }));
        }
        if (selector.includes('input') && selector.includes('textarea')) {
          return new Array(4).fill(null).map(() => ({ tagName: 'input' }));
        }
        if (selector.includes('card') || selector.includes('container')) {
          return new Array(5).fill(null).map(() => ({ tagName: 'div' }));
        }
        return new Array(20).fill(null).map(() => ({ tagName: 'div' }));
      });

      let globalCallIndex = 0;
      mockWindow.getComputedStyle.mockImplementation(() => {
        const index = globalCallIndex++;
        return {
          getPropertyValue: vi.fn().mockReturnValue(`${(index * 7) % 50 + 10}`), // Many different spacing values
          fontSize: `${12 + (index % 15)}px`, // Many font sizes
          fontFamily: `Font${index % 6}, sans-serif`, // Too many font families
          lineHeight: `${1.2 + (index % 8) * 0.1}`,
          color: `rgb(${(index * 17) % 255}, ${(index * 23) % 255}, ${(index * 29) % 255})`, // Many colors
          backgroundColor: `rgb(${(255 - index * 13) % 255}, ${(255 - index * 19) % 255}, ${(255 - index * 31) % 255})`,
          borderColor: 'transparent',
          maxWidth: `${300 + (index % 8) * 100}px`, // Many container widths
          width: 'auto',
          display: index % 3 === 0 ? 'grid' : 'flex', // Mixed layout
          float: 'none',
          border: `${(index % 4) + 1}px solid rgb(${index % 255}, 0, 0)`,
          borderRadius: `${(index % 6) * 2 + 2}px`,
          padding: `${(index % 5) + 8}px`,
          boxShadow: index % 2 === 0 ? 'none' : `0 ${index % 4 + 1}px ${(index % 4 + 1) * 2}px rgba(0,0,0,0.${(index % 3) + 1})`
        };
      });

      const result = auditVisualConsistency();

      expect(result.score).toBeLessThan(8); // Should have lower score due to many issues
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should include contextual recommendations', () => {
      const result = auditVisualConsistency();

      expect(result.recommendations).toContain('Create and document a design system with consistent spacing, typography, and color scales');
      expect(result.recommendations.length).toBeLessThanOrEqual(8);
    });
  });

  describe('getVisualConsistencyData', () => {
    beforeEach(() => {
      mockDocument.querySelectorAll.mockReturnValue([{ tagName: 'div' }]);
      mockWindow.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('16'),
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5',
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        borderColor: 'transparent'
      });
    });

    it('should return comprehensive visual consistency data', () => {
      const data = getVisualConsistencyData();

      expect(data).toHaveProperty('spacing');
      expect(data).toHaveProperty('typography');
      expect(data).toHaveProperty('colors');
      expect(data.spacing).toHaveProperty('margins');
      expect(data.spacing).toHaveProperty('paddings');
      expect(data.typography).toHaveProperty('fontSizes');
      expect(data.typography).toHaveProperty('fontFamilies');
      expect(data.colors).toHaveProperty('textColors');
      expect(data.colors).toHaveProperty('hexColors');
    });
  });

  // Test without window object
  describe('Without window object', () => {
    beforeEach(() => {
      // @ts-ignore
      global.window = undefined;
    });

    it('should return empty results when window is undefined', () => {
      const spacingValues = extractSpacingValues();
      const typographyValues = extractTypographyValues();
      const colorValues = extractColorValues();

      expect(spacingValues.margins).toHaveLength(0);
      expect(typographyValues.fontSizes).toHaveLength(0);
      expect(colorValues.textColors).toHaveLength(0);
    });

    it('should return empty issues when window is undefined', () => {
      const spacingIssues = analyzeSpacing();
      const typographyIssues = analyzeTypography();
      const colorIssues = analyzeColorPalette();
      const layoutIssues = analyzeLayout();

      expect(spacingIssues).toHaveLength(0);
      expect(typographyIssues).toHaveLength(0);
      expect(colorIssues).toHaveLength(0);
      expect(layoutIssues).toHaveLength(0);
    });

    it('should still return valid audit result when window is undefined', () => {
      const result = auditVisualConsistency();

      expect(result.score).toBe(10); // Perfect score when no issues found
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});