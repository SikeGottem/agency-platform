import type { AuditScore, PerformanceIssue } from './types';

/**
 * Analyzes image optimization
 */
export function analyzeImageOptimization(): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Check for missing width/height attributes
      if (!img.getAttribute('width') || !img.getAttribute('height')) {
        issues.push({
          type: 'image-optimization',
          severity: 'medium',
          element: 'img',
          description: 'Image missing width/height attributes (causes layout shift)',
          recommendation: 'Add explicit width and height attributes to prevent CLS'
        });
      }
      
      // Check for unoptimized image formats
      const src = img.src;
      if (src && !src.includes('.webp') && !src.includes('.avif')) {
        issues.push({
          type: 'image-optimization',
          severity: 'medium',
          description: 'Image not using modern format (WebP/AVIF)',
          recommendation: 'Convert images to WebP or AVIF format for better compression'
        });
      }
      
      // Check for missing lazy loading
      if (!img.getAttribute('loading')) {
        issues.push({
          type: 'image-optimization',
          severity: 'low',
          element: 'img',
          description: 'Image not using lazy loading',
          recommendation: 'Add loading="lazy" attribute for images below the fold'
        });
      }
    });
  }
  
  return issues;
}

/**
 * Measures Core Web Vitals (simplified)
 */
export function measureCoreWebVitals(): Promise<PerformanceIssue[]> {
  return new Promise((resolve) => {
    const issues: PerformanceIssue[] = [];
    
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Simplified CWV measurement (would use web-vitals library in production)
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // First Contentful Paint
          const fcp = navigation.responseStart - navigation.requestStart;
          if (fcp > 1800) { // 1.8s threshold
            issues.push({
              type: 'core-web-vitals',
              severity: 'high',
              metric: 'First Contentful Paint',
              currentValue: `${fcp}ms`,
              targetValue: '<1800ms',
              description: 'First Contentful Paint is too slow',
              recommendation: 'Optimize initial page load performance'
            });
          }
          
          // Largest Contentful Paint (approximated)
          const lcp = navigation.loadEventStart - navigation.requestStart;
          if (lcp > 2500) { // 2.5s threshold
            issues.push({
              type: 'core-web-vitals',
              severity: 'high',
              metric: 'Largest Contentful Paint',
              currentValue: `${lcp}ms`,
              targetValue: '<2500ms',
              description: 'Largest Contentful Paint is too slow',
              recommendation: 'Optimize largest content element loading'
            });
          }
        }
        
        resolve(issues);
      }, 1000);
    } else {
      resolve(issues);
    }
  });
}

/**
 * Analyzes bundle size and resource loading
 */
export function analyzeBundleSize(): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    
    resources.forEach((resource) => {
      if (resource.name.includes('.js')) {
        totalJSSize += resource.transferSize || 0;
      } else if (resource.name.includes('.css')) {
        totalCSSSize += resource.transferSize || 0;
      }
      
      // Check for large individual resources
      const size = resource.transferSize || 0;
      if (size > 500000) { // 500KB threshold
        issues.push({
          type: 'bundle-size',
          severity: 'medium',
          currentValue: `${Math.round(size / 1024)}KB`,
          targetValue: '<500KB',
          description: `Large resource: ${resource.name.split('/').pop()}`,
          recommendation: 'Consider code splitting or compression for large resources'
        });
      }
    });
    
    // Check total bundle sizes
    if (totalJSSize > 1000000) { // 1MB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'high',
        metric: 'Total JavaScript',
        currentValue: `${Math.round(totalJSSize / 1024)}KB`,
        targetValue: '<1MB',
        description: 'JavaScript bundle size is too large',
        recommendation: 'Implement code splitting and remove unused dependencies'
      });
    }
    
    if (totalCSSSize > 200000) { // 200KB threshold
      issues.push({
        type: 'bundle-size',
        severity: 'medium',
        metric: 'Total CSS',
        currentValue: `${Math.round(totalCSSSize / 1024)}KB`,
        targetValue: '<200KB',
        description: 'CSS bundle size is large',
        recommendation: 'Remove unused CSS and optimize stylesheets'
      });
    }
  }
  
  return issues;
}

/**
 * Runs a comprehensive performance audit
 */
export async function auditPerformance(): Promise<AuditScore> {
  const issues: PerformanceIssue[] = [];
  const recommendations: string[] = [];
  
  // Collect all performance issues
  issues.push(...analyzeImageOptimization());
  issues.push(...analyzeBundleSize());
  
  // Add Core Web Vitals issues
  const cwvIssues = await measureCoreWebVitals();
  issues.push(...cwvIssues);
  
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
  if (criticalIssues > 0 || highIssues > 0) {
    recommendations.push('Run Lighthouse audit for detailed performance insights');
  }
  recommendations.push('Optimize images with modern formats (WebP, AVIF)');
  recommendations.push('Implement proper lazy loading for below-fold content');
  recommendations.push('Monitor Core Web Vitals regularly');
  recommendations.push('Consider implementing service worker for caching');
  
  return {
    score: Math.round(score * 10) / 10,
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
}