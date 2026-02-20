import type { AuditScore, PerformanceIssue } from './types';

export interface CoreWebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface BundleAnalysis {
  totalJSSize: number;
  totalCSSSize: number;
  largestChunks: Array<{
    name: string;
    size: number;
    type: 'js' | 'css';
  }>;
}

export interface ImageOptimizationReport {
  totalImages: number;
  unoptimizedCount: number;
  unoptimizedImages: Array<{
    src: string;
    size?: number;
    format: string;
    issues: string[];
  }>;
}

/**
 * Analyzes image optimization with detailed reporting
 */
export function analyzeImageOptimization(): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const images = document.querySelectorAll('img');
    let unoptimizedCount = 0;
    
    images.forEach((img, index) => {
      const src = img.src;
      const alt = img.alt;
      const width = img.getAttribute('width');
      const height = img.getAttribute('height');
      const loading = img.getAttribute('loading');
      
      let imageIssues: string[] = [];
      
      // Check for missing width/height attributes (causes CLS)
      if (!width || !height) {
        imageIssues.push('Missing width/height attributes');
        issues.push({
          type: 'image-optimization',
          severity: 'medium',
          description: `Image ${index + 1}: Missing width/height attributes (causes layout shift)`,
          recommendation: 'Add explicit width and height attributes to prevent CLS'
        });
      }
      
      // Check for unoptimized image formats
      if (src && !src.includes('.webp') && !src.includes('.avif')) {
        const format = src.split('.').pop() || 'unknown';
        imageIssues.push(`Using ${format} instead of modern format`);
        unoptimizedCount++;
        issues.push({
          type: 'image-optimization',
          severity: 'medium',
          description: `Image ${index + 1}: Not using modern format (${format})`,
          recommendation: 'Convert to WebP or AVIF format for better compression'
        });
      }
      
      // Check for missing lazy loading
      if (!loading && index > 2) { // First 3 images should load eagerly
        imageIssues.push('Missing lazy loading');
        issues.push({
          type: 'image-optimization',
          severity: 'low',
          description: `Image ${index + 1}: Not using lazy loading`,
          recommendation: 'Add loading="lazy" attribute for images below the fold'
        });
      }
      
      // Check for missing alt text
      if (!alt) {
        imageIssues.push('Missing alt text');
        issues.push({
          type: 'image-optimization',
          severity: 'medium',
          description: `Image ${index + 1}: Missing alt text`,
          recommendation: 'Add descriptive alt text for accessibility'
        });
      }
    });
    
    // Add summary issue if many images are unoptimized
    if (unoptimizedCount > 0) {
      issues.push({
        type: 'image-optimization',
        severity: unoptimizedCount > images.length / 2 ? 'high' : 'medium',
        metric: 'Image Optimization',
        currentValue: `${unoptimizedCount}/${images.length}`,
        targetValue: '0 unoptimized',
        description: `${unoptimizedCount} of ${images.length} images are not optimized`,
        recommendation: 'Implement automated image optimization in build process'
      });
    }
  }
  
  return issues;
}

/**
 * Measures Core Web Vitals with comprehensive metrics
 */
export function measureCoreWebVitals(): Promise<{ metrics: CoreWebVitalsMetrics; issues: PerformanceIssue[] }> {
  return new Promise((resolve) => {
    const issues: PerformanceIssue[] = [];
    const metrics: CoreWebVitalsMetrics = {};
    
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Use PerformanceObserver to get more accurate metrics
        let lcp = 0;
        let cls = 0;
        let fid = 0;
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          lcp = lastEntry.startTime;
          metrics.lcp = lcp;
          
          if (lcp > 2500) { // 2.5s threshold (poor)
            issues.push({
              type: 'core-web-vitals',
              severity: 'high',
              metric: 'Largest Contentful Paint',
              currentValue: `${Math.round(lcp)}ms`,
              targetValue: '<2500ms',
              description: 'Largest Contentful Paint is too slow',
              recommendation: 'Optimize largest content element loading, reduce server response time'
            });
          } else if (lcp > 1200) { // 1.2s threshold (needs improvement)
            issues.push({
              type: 'core-web-vitals',
              severity: 'medium',
              metric: 'Largest Contentful Paint',
              currentValue: `${Math.round(lcp)}ms`,
              targetValue: '<1200ms (good)',
              description: 'Largest Contentful Paint could be improved',
              recommendation: 'Consider optimizing images and reducing blocking resources'
            });
          }
        });
        
        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          // Fallback to navigation timing
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            lcp = navigation.loadEventStart - navigation.requestStart;
            metrics.lcp = lcp;
          }
        }
        
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          metrics.cls = cls;
          
          if (cls > 0.25) { // Poor threshold
            issues.push({
              type: 'core-web-vitals',
              severity: 'high',
              metric: 'Cumulative Layout Shift',
              currentValue: cls.toFixed(3),
              targetValue: '<0.1',
              description: 'Cumulative Layout Shift is too high',
              recommendation: 'Add width/height to images, reserve space for dynamic content'
            });
          } else if (cls > 0.1) { // Needs improvement threshold
            issues.push({
              type: 'core-web-vitals',
              severity: 'medium',
              metric: 'Cumulative Layout Shift',
              currentValue: cls.toFixed(3),
              targetValue: '<0.1 (good)',
              description: 'Cumulative Layout Shift could be improved',
              recommendation: 'Ensure consistent sizing for dynamic elements'
            });
          }
        });
        
        try {
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          // Layout shift not supported
        }
        
        // First Input Delay (approximate with event timing)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            fid = entry.processingStart - entry.startTime;
            metrics.fid = fid;
            
            if (fid > 300) { // 300ms threshold (poor)
              issues.push({
                type: 'core-web-vitals',
                severity: 'high',
                metric: 'First Input Delay',
                currentValue: `${Math.round(fid)}ms`,
                targetValue: '<100ms',
                description: 'First Input Delay is too high',
                recommendation: 'Reduce main thread blocking, optimize JavaScript execution'
              });
            } else if (fid > 100) { // 100ms threshold (needs improvement)
              issues.push({
                type: 'core-web-vitals',
                severity: 'medium',
                metric: 'First Input Delay',
                currentValue: `${Math.round(fid)}ms`,
                targetValue: '<100ms (good)',
                description: 'First Input Delay could be improved',
                recommendation: 'Consider code splitting and reducing JavaScript payload'
              });
            }
            break; // Only measure first input
          }
        });
        
        try {
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          // First input delay not supported
        }
        
        // Additional metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // First Contentful Paint (approximate)
          const fcp = navigation.responseEnd - navigation.requestStart;
          metrics.fcp = fcp;
          
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.requestStart;
          metrics.ttfb = ttfb;
          
          if (ttfb > 800) { // 800ms threshold
            issues.push({
              type: 'core-web-vitals',
              severity: 'medium',
              metric: 'Time to First Byte',
              currentValue: `${Math.round(ttfb)}ms`,
              targetValue: '<600ms',
              description: 'Server response time is slow',
              recommendation: 'Optimize server performance, consider CDN, enable caching'
            });
          }
        }
        
        // Wait a bit for observers to collect data
        setTimeout(() => {
          resolve({ metrics, issues });
        }, 2000);
        
      } catch (error) {
        console.error('Error measuring Core Web Vitals:', error);
        resolve({ metrics, issues });
      }
    } else {
      resolve({ metrics, issues });
    }
  });
}

/**
 * Analyzes bundle size and resource loading with detailed chunk identification
 */
export function analyzeBundleSize(): { analysis: BundleAnalysis; issues: PerformanceIssue[] } {
  const issues: PerformanceIssue[] = [];
  const analysis: BundleAnalysis = {
    totalJSSize: 0,
    totalCSSSize: 0,
    largestChunks: []
  };
  
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const chunks: Array<{ name: string; size: number; type: 'js' | 'css' }> = [];
    
    resources.forEach((resource) => {
      const size = resource.transferSize || resource.encodedBodySize || 0;
      const name = resource.name.split('/').pop() || resource.name;
      
      if (resource.name.includes('.js') || resource.name.endsWith('.js')) {
        analysis.totalJSSize += size;
        chunks.push({ name, size, type: 'js' });
        
        // Check for large individual JS chunks
        if (size > 500000) { // 500KB threshold
          issues.push({
            type: 'bundle-size',
            severity: 'high',
            currentValue: `${Math.round(size / 1024)}KB`,
            targetValue: '<500KB',
            description: `Large JavaScript chunk: ${name}`,
            recommendation: 'Consider code splitting or lazy loading for large chunks'
          });
        } else if (size > 250000) { // 250KB threshold
          issues.push({
            type: 'bundle-size',
            severity: 'medium',
            currentValue: `${Math.round(size / 1024)}KB`,
            targetValue: '<250KB',
            description: `Medium JavaScript chunk: ${name}`,
            recommendation: 'Monitor chunk size growth and consider optimization'
          });
        }
      } else if (resource.name.includes('.css') || resource.name.endsWith('.css')) {
        analysis.totalCSSSize += size;
        chunks.push({ name, size, type: 'css' });
        
        // Check for large individual CSS files
        if (size > 100000) { // 100KB threshold
          issues.push({
            type: 'bundle-size',
            severity: 'medium',
            currentValue: `${Math.round(size / 1024)}KB`,
            targetValue: '<100KB',
            description: `Large CSS file: ${name}`,
            recommendation: 'Remove unused CSS rules or split into smaller files'
          });
        }
      }
    });
    
    // Sort and get largest chunks
    analysis.largestChunks = chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(chunk => ({
        ...chunk,
        size: Math.round(chunk.size / 1024) // Convert to KB
      }));
    
    // Check total bundle sizes
    const totalJSKB = Math.round(analysis.totalJSSize / 1024);
    const totalCSSKB = Math.round(analysis.totalCSSSize / 1024);
    
    if (analysis.totalJSSize > 1000000) { // 1MB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'critical',
        metric: 'Total JavaScript',
        currentValue: `${totalJSKB}KB`,
        targetValue: '<1000KB',
        description: 'JavaScript bundle size is critically large',
        recommendation: 'Implement aggressive code splitting and remove unused dependencies'
      });
    } else if (analysis.totalJSSize > 500000) { // 500KB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'high',
        metric: 'Total JavaScript',
        currentValue: `${totalJSKB}KB`,
        targetValue: '<500KB',
        description: 'JavaScript bundle size is large',
        recommendation: 'Implement code splitting and optimize dependencies'
      });
    }
    
    if (analysis.totalCSSSize > 200000) { // 200KB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'high',
        metric: 'Total CSS',
        currentValue: `${totalCSSKB}KB`,
        targetValue: '<200KB',
        description: 'CSS bundle size is large',
        recommendation: 'Remove unused CSS and optimize stylesheets'
      });
    } else if (analysis.totalCSSSize > 100000) { // 100KB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'medium',
        metric: 'Total CSS',
        currentValue: `${totalCSSKB}KB`,
        targetValue: '<100KB',
        description: 'CSS bundle size could be optimized',
        recommendation: 'Consider CSS tree-shaking and minification'
      });
    }
    
    // Warn about too many chunks (can hurt HTTP/2 performance)
    const jsChunks = chunks.filter(c => c.type === 'js').length;
    if (jsChunks > 10) {
      issues.push({
        type: 'bundle-size',
        severity: 'medium',
        metric: 'Chunk Count',
        currentValue: `${jsChunks} chunks`,
        targetValue: '<10 chunks',
        description: 'Too many JavaScript chunks may hurt performance',
        recommendation: 'Consider consolidating smaller chunks or using module bundling'
      });
    }
  }
  
  return { analysis, issues };
}

/**
 * Measures loading performance for specific dashboard pages
 */
export async function measureDashboardPerformance(pages: string[] = ['/dashboard', '/dashboard/analytics', '/dashboard/settings']): Promise<PerformanceIssue[]> {
  const issues: PerformanceIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    
    // Check if we're on a dashboard page
    const isDashboardPage = pages.some(page => currentPath.includes(page.replace('/dashboard', '')) || currentPath === page);
    
    if (isDashboardPage) {
      // Measure dashboard-specific metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Page load time
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        if (loadTime > 3000) { // 3s threshold for dashboard pages
          issues.push({
            type: 'loading-time',
            severity: 'high',
            metric: 'Dashboard Load Time',
            currentValue: `${Math.round(loadTime)}ms`,
            targetValue: '<3000ms',
            description: `Dashboard page (${currentPath}) loads too slowly`,
            recommendation: 'Optimize dashboard components, implement progressive loading'
          });
        }
        
        // Time to Interactive (approximate)
        const tti = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        if (tti > 2000) { // 2s threshold for interactivity
          issues.push({
            type: 'loading-time',
            severity: 'medium',
            metric: 'Time to Interactive',
            currentValue: `${Math.round(tti)}ms`,
            targetValue: '<2000ms',
            description: 'Dashboard takes too long to become interactive',
            recommendation: 'Reduce main thread blocking, defer non-critical JavaScript'
          });
        }
        
        // DOM size check for dashboard complexity
        const domSize = document.querySelectorAll('*').length;
        if (domSize > 1500) {
          issues.push({
            type: 'loading-time',
            severity: 'medium',
            metric: 'DOM Complexity',
            currentValue: `${domSize} elements`,
            targetValue: '<1500 elements',
            description: 'Dashboard DOM is complex, may impact performance',
            recommendation: 'Consider virtualizing large lists, lazy load dashboard widgets'
          });
        }
      }
    }
  }
  
  return issues;
}

/**
 * Lighthouse-style performance audit (simplified)
 */
export async function runLighthouseAudit(url: string = typeof window !== 'undefined' ? window.location?.href || 'http://localhost:3000' : 'http://localhost:3000'): Promise<PerformanceIssue[]> {
  const issues: PerformanceIssue[] = [];
  
  // This would normally use the Lighthouse Node API
  // For browser execution, we simulate key Lighthouse checks
  if (typeof window !== 'undefined') {
    // Check for render-blocking resources
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    let renderBlockingResources = 0;
    stylesheets.forEach((link: any) => {
      if (!link.media || link.media === 'all') {
        renderBlockingResources++;
      }
    });
    
    scripts.forEach((script: any) => {
      if (!script.async && !script.defer) {
        renderBlockingResources++;
      }
    });
    
    if (renderBlockingResources > 3) {
      issues.push({
        type: 'loading-time',
        severity: 'medium',
        metric: 'Render-blocking Resources',
        currentValue: `${renderBlockingResources}`,
        targetValue: '<3',
        description: 'Multiple render-blocking resources delay page rendering',
        recommendation: 'Add async/defer to scripts, inline critical CSS'
      });
    }
    
    // Check for unused JavaScript (simplified)
    const totalScripts = scripts.length;
    if (totalScripts > 10) {
      issues.push({
        type: 'bundle-size',
        severity: 'medium',
        metric: 'Script Count',
        currentValue: `${totalScripts}`,
        targetValue: '<10',
        description: 'Many script tags may indicate unused JavaScript',
        recommendation: 'Audit and remove unused JavaScript libraries'
      });
    }
    
    // Check for missing compression hints
    const textResources = performance.getEntriesByType('resource').filter((r: any) => 
      r.name.includes('.js') || r.name.includes('.css') || r.name.includes('.html')
    );
    
    let uncompressedResources = 0;
    textResources.forEach((resource: any) => {
      // Check if resource seems uncompressed (heuristic)
      if (resource.transferSize && resource.encodedBodySize) {
        const compressionRatio = resource.transferSize / resource.encodedBodySize;
        if (compressionRatio > 0.8 && resource.encodedBodySize > 1024) {
          uncompressedResources++;
        }
      }
    });
    
    if (uncompressedResources > 0) {
      issues.push({
        type: 'bundle-size',
        severity: 'medium',
        metric: 'Text Compression',
        currentValue: `${uncompressedResources} uncompressed`,
        targetValue: '0',
        description: 'Text resources are not properly compressed',
        recommendation: 'Enable gzip/brotli compression on server'
      });
    }
  }
  
  return issues;
}

/**
 * Runs a comprehensive performance audit with structured data
 */
export async function auditPerformance(pages: string[] = ['/dashboard', '/dashboard/analytics']): Promise<{
  score: AuditScore;
  metrics: CoreWebVitalsMetrics;
  bundleAnalysis: BundleAnalysis;
  imageReport: ImageOptimizationReport;
  dashboardIssues: PerformanceIssue[];
  lighthouseIssues: PerformanceIssue[];
}> {
  const allIssues: PerformanceIssue[] = [];
  const recommendations: string[] = [];
  
  // 1. Lighthouse audit
  const lighthouseIssues = await runLighthouseAudit();
  allIssues.push(...lighthouseIssues);
  
  // 2. Core Web Vitals measurement
  const { metrics, issues: cwvIssues } = await measureCoreWebVitals();
  allIssues.push(...cwvIssues);
  
  // 3. Image optimization analysis
  const imageOptIssues = analyzeImageOptimization();
  allIssues.push(...imageOptIssues);
  
  // Create image report
  const images = typeof window !== 'undefined' ? document.querySelectorAll('img') : [];
  const imageReport: ImageOptimizationReport = {
    totalImages: images.length,
    unoptimizedCount: imageOptIssues.filter(i => i.type === 'image-optimization').length,
    unoptimizedImages: Array.from(images).map((img, index) => ({
      src: img.src,
      format: img.src.split('.').pop() || 'unknown',
      issues: imageOptIssues
        .filter(issue => issue.description.includes(`Image ${index + 1}`))
        .map(issue => issue.description)
    })).filter(img => img.issues.length > 0)
  };
  
  // 4. Bundle size analysis
  const { analysis: bundleAnalysis, issues: bundleIssues } = analyzeBundleSize();
  allIssues.push(...bundleIssues);
  
  // 5. Dashboard-specific performance
  const dashboardIssues = await measureDashboardPerformance(pages);
  allIssues.push(...dashboardIssues);
  
  // Calculate performance score based on weighted issues
  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
  const highIssues = allIssues.filter(i => i.severity === 'high').length;
  const mediumIssues = allIssues.filter(i => i.severity === 'medium').length;
  const lowIssues = allIssues.filter(i => i.severity === 'low').length;
  
  let score = 10;
  score -= criticalIssues * 3;
  score -= highIssues * 2;
  score -= mediumIssues * 1;
  score -= lowIssues * 0.5;
  
  score = Math.max(1, Math.min(10, score));
  
  // Generate contextual recommendations
  if (criticalIssues > 0) {
    recommendations.push('URGENT: Address critical performance issues immediately');
  }
  if (cwvIssues.length > 0) {
    recommendations.push('Focus on Core Web Vitals improvements for better user experience');
  }
  if (bundleAnalysis.totalJSSize > 500000) {
    recommendations.push('Implement code splitting and reduce bundle size');
  }
  if (imageReport.unoptimizedCount > 0) {
    recommendations.push('Optimize images with modern formats (WebP, AVIF) and proper sizing');
  }
  if (dashboardIssues.length > 0) {
    recommendations.push('Optimize dashboard loading performance with progressive loading');
  }
  
  // Always include these best practices
  recommendations.push('Monitor Core Web Vitals in production');
  recommendations.push('Run regular Lighthouse audits');
  recommendations.push('Implement performance budgets in CI/CD');
  
  const auditScore: AuditScore = {
    score: Math.round(score * 10) / 10,
    issues: allIssues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
  
  return {
    score: auditScore,
    metrics,
    bundleAnalysis,
    imageReport,
    dashboardIssues,
    lighthouseIssues
  };
}