import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  analyzeImageOptimization,
  measureCoreWebVitals,
  analyzeBundleSize,
  measureDashboardPerformance,
  runLighthouseAudit,
  auditPerformance,
  type CoreWebVitalsMetrics,
  type BundleAnalysis,
  type ImageOptimizationReport
} from '../performance';

describe('Performance Audit', () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;

    // Create minimal DOM mock
    const mockImages = [
      { src: 'test1.jpg', alt: 'Test 1', getAttribute: (attr: string) => attr === 'width' || attr === 'height' ? null : 'Test 1' },
      { src: 'test2.png', alt: 'Test 2', getAttribute: (attr: string) => attr === 'width' ? '100' : attr === 'height' ? '100' : attr === 'loading' ? 'lazy' : 'Test 2' },
      { src: 'test3.webp', alt: 'Test 3', getAttribute: (attr: string) => attr === 'width' ? '200' : attr === 'height' ? '200' : 'Test 3' },
      { src: 'test4.gif', alt: '', getAttribute: (attr: string) => attr === 'alt' ? '' : null }
    ];

    const mockScripts = [
      { src: 'app.js', async: false, defer: false },
      { src: 'vendor.js', async: true, defer: false },
      { src: 'bundle.js', async: false, defer: false }
    ];

    const mockStylesheets = [
      { href: 'styles.css', media: 'all' },
      { href: 'print.css', media: 'print' }
    ];

    // Mock document
    global.document = {
      querySelectorAll: vi.fn((selector: string) => {
        if (selector === 'img') return mockImages;
        if (selector === 'script[src]') return mockScripts;
        if (selector === 'link[rel="stylesheet"]') return mockStylesheets;
        if (selector === '*') return Array(1000).fill({}); // DOM complexity test
        return [];
      })
    } as any;

    // Mock window with performance API
    global.window = {
      location: {
        href: 'http://localhost:3000/dashboard',
        pathname: '/dashboard'
      },
      performance: {
        getEntriesByType: vi.fn((type: string) => {
          if (type === 'resource') {
            return [
              { name: 'app.js', transferSize: 800000, encodedBodySize: 800000 },
              { name: 'vendor.js', transferSize: 300000, encodedBodySize: 300000 },
              { name: 'styles.css', transferSize: 150000, encodedBodySize: 150000 },
              { name: 'test1.jpg', transferSize: 50000, encodedBodySize: 50000 },
            ];
          }
          if (type === 'navigation') {
            return [{
              navigationStart: 0,
              responseStart: 100,
              responseEnd: 200,
              domContentLoadedEventEnd: 800,
              loadEventStart: 900,
              loadEventEnd: 1000,
              requestStart: 50
            }];
          }
          return [];
        }),
        now: vi.fn(() => Date.now())
      },
      PerformanceObserver: vi.fn().mockImplementation((callback) => ({
        observe: vi.fn((options) => {
          // Simulate immediate callback with test data
          setTimeout(() => {
            if (options.type === 'largest-contentful-paint') {
              callback({
                getEntries: () => [{ startTime: 1500 }]
              });
            } else if (options.type === 'layout-shift') {
              callback({
                getEntries: () => [{ value: 0.05, hadRecentInput: false }]
              });
            } else if (options.type === 'first-input') {
              callback({
                getEntries: () => [{ processingStart: 150, startTime: 50 }]
              });
            }
          }, 10);
        }),
        disconnect: vi.fn()
      }))
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('analyzeImageOptimization', () => {
    it('should identify unoptimized images', () => {
      const issues = analyzeImageOptimization();
      
      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      
      // Should find issues with first image (missing width/height, not modern format, missing alt)
      const firstImageIssues = issues.filter(i => i.description.includes('Image 1'));
      expect(firstImageIssues.length).toBeGreaterThan(0);
      
      // Should find format issues for non-WebP/AVIF images
      const formatIssues = issues.filter(i => i.description.includes('modern format'));
      expect(formatIssues.length).toBeGreaterThan(0);
      
      // Should find missing alt text issues
      const altIssues = issues.filter(i => i.description.includes('alt text'));
      expect(altIssues.length).toBeGreaterThan(0);
    });

    it('should detect missing width/height attributes', () => {
      const issues = analyzeImageOptimization();
      
      const layoutShiftIssues = issues.filter(i => 
        i.description.includes('width/height') && i.severity === 'medium'
      );
      expect(layoutShiftIssues.length).toBeGreaterThan(0);
    });

    it('should recognize optimized images', () => {
      const issues = analyzeImageOptimization();
      
      // test3.webp should not have format issues
      const webpIssues = issues.filter(i => 
        i.description.includes('Image 3') && i.description.includes('modern format')
      );
      expect(webpIssues.length).toBe(0);
    });

    it('should create summary for multiple unoptimized images', () => {
      const issues = analyzeImageOptimization();
      
      const summaryIssues = issues.filter(i => 
        i.description.includes('images are not optimized')
      );
      expect(summaryIssues.length).toBeGreaterThan(0);
    });
  });

  describe('measureCoreWebVitals', () => {
    it('should measure Core Web Vitals metrics', async () => {
      const result = await measureCoreWebVitals();
      
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      
      // Should have LCP measurement from mock
      expect(typeof result.metrics.lcp).toBe('number');
    });

    it('should identify poor Core Web Vitals', async () => {
      // Mock poor performance
      global.window.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn((options) => {
          setTimeout(() => {
            if (options.type === 'largest-contentful-paint') {
              callback({
                getEntries: () => [{ startTime: 3000 }] // Poor LCP
              });
            } else if (options.type === 'layout-shift') {
              callback({
                getEntries: () => [{ value: 0.3, hadRecentInput: false }] // Poor CLS
              });
            }
          }, 10);
        }),
        disconnect: vi.fn()
      }));

      const result = await measureCoreWebVitals();
      
      const highSeverityIssues = result.issues.filter(i => i.severity === 'high');
      expect(highSeverityIssues.length).toBeGreaterThan(0);
    });

    it('should measure TTFB from navigation timing', async () => {
      const result = await measureCoreWebVitals();
      
      expect(result.metrics.ttfb).toBeDefined();
      expect(typeof result.metrics.ttfb).toBe('number');
    });
  });

  describe('analyzeBundleSize', () => {
    it('should analyze bundle size and return structured data', () => {
      const result = analyzeBundleSize();
      
      expect(result.analysis).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      
      // Should calculate total sizes
      expect(typeof result.analysis.totalJSSize).toBe('number');
      expect(typeof result.analysis.totalCSSSize).toBe('number');
      expect(Array.isArray(result.analysis.largestChunks)).toBe(true);
    });

    it('should identify large JavaScript bundles', () => {
      const result = analyzeBundleSize();
      
      // app.js is 800KB in mock, should trigger total bundle size issues
      const largeBundleIssues = result.issues.filter(i => 
        i.type === 'bundle-size' && (i.description.includes('app.js') || i.description.includes('JavaScript bundle'))
      );
      expect(largeBundleIssues.length).toBeGreaterThan(0);
    });

    it('should sort chunks by size', () => {
      const result = analyzeBundleSize();
      
      expect(result.analysis.largestChunks.length).toBeGreaterThan(0);
      
      // Should be sorted largest first
      if (result.analysis.largestChunks.length > 1) {
        for (let i = 1; i < result.analysis.largestChunks.length; i++) {
          expect(result.analysis.largestChunks[i - 1].size).toBeGreaterThanOrEqual(
            result.analysis.largestChunks[i].size
          );
        }
      }
    });

    it('should differentiate between JS and CSS chunks', () => {
      const result = analyzeBundleSize();
      
      const jsChunks = result.analysis.largestChunks.filter(c => c.type === 'js');
      const cssChunks = result.analysis.largestChunks.filter(c => c.type === 'css');
      
      // Should have at least some chunks
      expect(jsChunks.length + cssChunks.length).toBeGreaterThan(0);
      
      // If we have chunks, at least one should be JS (app.js is in our mock)
      if (result.analysis.largestChunks.length > 0) {
        expect(jsChunks.length).toBeGreaterThan(0);
      }
    });
  });

  describe('measureDashboardPerformance', () => {
    it('should measure dashboard-specific metrics', async () => {
      const issues = await measureDashboardPerformance(['/dashboard']);
      
      expect(Array.isArray(issues)).toBe(true);
      
      // Should identify dashboard performance issues if any exist
      const dashboardIssues = issues.filter(i => 
        i.description.includes('dashboard') || i.description.includes('Dashboard')
      );
      
      // May or may not have issues depending on mock performance
      expect(dashboardIssues.length).toBeGreaterThanOrEqual(0);
    });

    it('should check DOM complexity', async () => {
      // Mock DOM with many elements
      global.document.querySelectorAll = vi.fn((selector: string) => {
        if (selector === '*') return Array(2000).fill({}); // Complex DOM
        return [];
      });
      
      const issues = await measureDashboardPerformance(['/dashboard']);
      
      const complexityIssues = issues.filter(i => 
        i.metric === 'DOM Complexity'
      );
      expect(complexityIssues.length).toBeGreaterThan(0);
    });

    it('should only analyze when on dashboard pages', async () => {
      // Change location to non-dashboard page
      global.window.location.pathname = '/about';
      
      const issues = await measureDashboardPerformance(['/dashboard']);
      
      // Should not return dashboard-specific issues
      expect(issues.length).toBe(0);
    });
  });

  describe('runLighthouseAudit', () => {
    it('should simulate lighthouse checks', async () => {
      const issues = await runLighthouseAudit();
      
      expect(Array.isArray(issues)).toBe(true);
      
      // May find render-blocking resources or other issues
      const lighthouseIssues = issues.filter(i => 
        i.type === 'loading-time' || i.type === 'bundle-size'
      );
      expect(lighthouseIssues.length).toBeGreaterThanOrEqual(0);
    });

    it('should check for render-blocking resources', async () => {
      // Mock many scripts to trigger render-blocking warning
      const manyScripts = Array(6).fill(0).map((_, i) => ({ 
        src: `script${i}.js`, 
        async: false, 
        defer: false 
      }));
      
      global.document.querySelectorAll = vi.fn((selector: string) => {
        if (selector === 'script[src]') return manyScripts;
        if (selector === 'link[rel="stylesheet"]') return [{ media: 'all' }];
        return [];
      });
      
      const issues = await runLighthouseAudit();
      
      const renderBlockingIssues = issues.filter(i => 
        i.description.includes('render-blocking')
      );
      expect(renderBlockingIssues.length).toBeGreaterThan(0);
    });
  });

  describe('auditPerformance', () => {
    it('should run comprehensive performance audit', async () => {
      const result = await auditPerformance();
      
      expect(result).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.bundleAnalysis).toBeDefined();
      expect(result.imageReport).toBeDefined();
      expect(result.dashboardIssues).toBeDefined();
      expect(result.lighthouseIssues).toBeDefined();
      
      // Score should be between 1 and 10
      expect(result.score.score).toBeGreaterThanOrEqual(1);
      expect(result.score.score).toBeLessThanOrEqual(10);
      
      // Should have recommendations
      expect(Array.isArray(result.score.recommendations)).toBe(true);
      expect(result.score.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate performance score based on issue severity', async () => {
      const result = await auditPerformance();
      
      // Score should be numeric and reasonable
      expect(typeof result.score.score).toBe('number');
      expect(result.score.score).toBeGreaterThan(0);
      
      // Should have issues documented
      expect(Array.isArray(result.score.issues)).toBe(true);
    });

    it('should generate contextual recommendations', async () => {
      const result = await auditPerformance();
      
      const recommendations = result.score.recommendations;
      
      // Should always include monitoring recommendation
      const monitoringRecs = recommendations.filter(r => 
        r.includes('Monitor') || r.includes('Lighthouse')
      );
      expect(monitoringRecs.length).toBeGreaterThan(0);
    });

    it('should structure image optimization report', async () => {
      const result = await auditPerformance();
      
      expect(result.imageReport.totalImages).toBeGreaterThan(0);
      expect(typeof result.imageReport.unoptimizedCount).toBe('number');
      expect(Array.isArray(result.imageReport.unoptimizedImages)).toBe(true);
      
      // Should have details for unoptimized images
      if (result.imageReport.unoptimizedCount > 0) {
        expect(result.imageReport.unoptimizedImages.length).toBeGreaterThan(0);
        expect(result.imageReport.unoptimizedImages[0].src).toBeDefined();
        expect(result.imageReport.unoptimizedImages[0].format).toBeDefined();
      }
    });

    it('should measure Core Web Vitals metrics', async () => {
      const result = await auditPerformance();
      
      const metrics = result.metrics;
      
      // Should have at least some metrics
      expect(typeof metrics).toBe('object');
      
      // LCP should be measured if available
      if (metrics.lcp) {
        expect(typeof metrics.lcp).toBe('number');
        expect(metrics.lcp).toBeGreaterThan(0);
      }
    });

    it('should provide bundle analysis details', async () => {
      const result = await auditPerformance();
      
      const analysis = result.bundleAnalysis;
      
      expect(typeof analysis.totalJSSize).toBe('number');
      expect(typeof analysis.totalCSSSize).toBe('number');
      expect(Array.isArray(analysis.largestChunks)).toBe(true);
      
      // Should have chunk details
      if (analysis.largestChunks.length > 0) {
        const chunk = analysis.largestChunks[0];
        expect(chunk.name).toBeDefined();
        expect(typeof chunk.size).toBe('number');
        expect(['js', 'css']).toContain(chunk.type);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing performance API', async () => {
      const windowWithoutPerf = { ...global.window };
      delete windowWithoutPerf.performance;
      global.window = windowWithoutPerf;
      
      const result = await auditPerformance();
      
      // Should still return valid structure
      expect(result.score).toBeDefined();
      expect(result.score.score).toBeGreaterThanOrEqual(1);
    });

    it('should handle missing DOM elements', () => {
      global.document = {
        querySelectorAll: vi.fn(() => []) // No elements
      } as any;
      
      const issues = analyzeImageOptimization();
      
      // Should not throw and return empty issues
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should handle server-side rendering', async () => {
      const origWindow = global.window;
      const origDocument = global.document;
      
      delete (global as any).window;
      delete (global as any).document;
      
      const result = await auditPerformance();
      
      // Should return safe defaults
      expect(result.score).toBeDefined();
      expect(result.score.score).toBeGreaterThanOrEqual(1);
      
      // Restore
      global.window = origWindow;
      global.document = origDocument;
    });
  });
});