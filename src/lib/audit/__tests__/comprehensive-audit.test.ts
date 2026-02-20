import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runComprehensiveAudit, generateComprehensiveAuditReport, runDesignAudit } from '../index';

// Mock the individual audit modules
vi.mock('../accessibility', () => ({
  auditAccessibilitySync: vi.fn(() => ({
    score: 7.5,
    issues: [
      'HIGH: Color contrast ratio 3.2:1 below WCAG standards (requires 4.5:1)',
      'MEDIUM: Button missing accessible name',
      'LOW: Focus indicator could be more visible'
    ],
    recommendations: [
      'Fix color contrast ratios to meet WCAG standards',
      'Add ARIA labels to interactive elements',
      'Improve focus indicators'
    ]
  }))
}));

vi.mock('../performance', () => ({
  auditPerformance: vi.fn(() => Promise.resolve({
    score: {
      score: 6.2,
      issues: [
        'CRITICAL: Large bundle size affects loading performance',
        'HIGH: Images not optimized for web delivery',
        'MEDIUM: Missing compression on text resources'
      ],
      recommendations: [
        'Implement code splitting to reduce bundle size',
        'Optimize images with modern formats',
        'Enable gzip compression on server'
      ]
    },
    dashboardIssues: [
      {
        type: 'bundle-size',
        severity: 'critical',
        metric: 'JavaScript Bundle',
        currentValue: '2.1MB',
        targetValue: '<500KB',
        description: 'Large bundle size affects loading performance',
        recommendation: 'Implement code splitting to reduce bundle size'
      },
      {
        type: 'image-optimization',
        severity: 'high',
        metric: 'Image Formats',
        description: 'Images not optimized for web delivery',
        recommendation: 'Convert images to WebP/AVIF formats'
      }
    ],
    lighthouseIssues: []
  }))
}));

vi.mock('../mobile-ux', () => ({
  auditMobileUX: vi.fn(() => ({
    score: 8.1,
    issues: [
      'MEDIUM: Some touch targets smaller than 44px minimum',
      'LOW: Minor responsive design inconsistencies'
    ],
    recommendations: [
      'Increase touch target sizes to minimum 44px',
      'Review responsive breakpoints'
    ]
  }))
}));

vi.mock('../visual-consistency', () => ({
  auditVisualConsistency: vi.fn(() => ({
    score: 5.8,
    issues: [
      'HIGH: Inconsistent spacing system across components',
      'MEDIUM: Typography scale not followed consistently',
      'MEDIUM: Color palette has too many variations'
    ],
    recommendations: [
      'Define and implement consistent spacing system',
      'Standardize typography scale',
      'Limit color palette to defined values'
    ]
  }))
}));

vi.mock('../interaction-design', () => ({
  auditInteractionDesign: vi.fn(() => ({
    score: 7.3,
    issues: [
      'HIGH: Missing loading states for async operations',
      'MEDIUM: Error messages could be more helpful',
      'LOW: Minor micro-interaction polish needed'
    ],
    recommendations: [
      'Add loading states to all async operations',
      'Improve error message clarity',
      'Polish micro-interactions'
    ]
  }))
}));

describe('Comprehensive Audit System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runDesignAudit', () => {
    it('should run basic design audit and return scores', async () => {
      const result = await runDesignAudit();
      
      expect(result).toHaveProperty('accessibility');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('mobileUX');
      expect(result).toHaveProperty('visualConsistency');
      expect(result).toHaveProperty('interactionDesign');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('timestamp');
      
      expect(result.overallScore).toBe(7.0); // (7.5 + 6.2 + 8.1 + 5.8 + 7.3) / 5 = 7.0 (rounded)
    });

    it('should handle performance audit returning object structure', async () => {
      const result = await runDesignAudit();
      
      expect(result.performance).toHaveProperty('score');
      expect(result.performance).toHaveProperty('issues');
      expect(result.performance).toHaveProperty('recommendations');
    });
  });

  describe('runComprehensiveAudit', () => {
    it('should run comprehensive audit with structured issues', async () => {
      const result = await runComprehensiveAudit();
      
      // Basic audit properties
      expect(result).toHaveProperty('accessibility');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('mobileUX');
      expect(result).toHaveProperty('visualConsistency');
      expect(result).toHaveProperty('interactionDesign');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('timestamp');
      
      // Enhanced properties
      expect(result).toHaveProperty('allIssues');
      expect(result).toHaveProperty('topIssues');
      expect(result).toHaveProperty('issuesByCategory');
      expect(result).toHaveProperty('issuesBySeverity');
      
      expect(Array.isArray(result.allIssues)).toBe(true);
      expect(Array.isArray(result.topIssues)).toBe(true);
      expect(result.topIssues.length).toBeLessThanOrEqual(5);
    });

    it('should structure issues with all required properties', async () => {
      const result = await runComprehensiveAudit();
      
      expect(result.allIssues.length).toBeGreaterThan(0);
      
      const issue = result.allIssues[0];
      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('category');
      expect(issue).toHaveProperty('type');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('priority');
      expect(issue).toHaveProperty('location');
      expect(issue).toHaveProperty('description');
      expect(issue).toHaveProperty('impact');
      expect(issue).toHaveProperty('recommendation');
    });

    it('should prioritize issues correctly', async () => {
      const result = await runComprehensiveAudit();
      
      // Issues should be sorted by priority (descending)
      for (let i = 1; i < result.allIssues.length; i++) {
        expect(result.allIssues[i-1].priority).toBeGreaterThanOrEqual(result.allIssues[i].priority);
      }
      
      // Critical issues should have higher priority than others
      const criticalIssues = result.allIssues.filter(i => i.severity === 'critical');
      const highIssues = result.allIssues.filter(i => i.severity === 'high');
      
      if (criticalIssues.length > 0 && highIssues.length > 0) {
        expect(criticalIssues[0].priority).toBeGreaterThan(highIssues[0].priority);
      }
    });

    it('should group issues by category correctly', async () => {
      const result = await runComprehensiveAudit();
      
      const categories = Object.keys(result.issuesByCategory);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that each category contains appropriate issues
      for (const category of categories) {
        const issues = result.issuesByCategory[category];
        expect(Array.isArray(issues)).toBe(true);
        
        for (const issue of issues) {
          expect(issue.category).toBe(category);
        }
      }
    });

    it('should group issues by severity correctly', async () => {
      const result = await runComprehensiveAudit();
      
      const severities = Object.keys(result.issuesBySeverity);
      expect(severities.length).toBeGreaterThan(0);
      
      // Check that each severity group contains appropriate issues
      for (const severity of severities) {
        const issues = result.issuesBySeverity[severity];
        expect(Array.isArray(issues)).toBe(true);
        
        for (const issue of issues) {
          expect(issue.severity).toBe(severity);
        }
      }
    });

    it('should include performance issues from detailed audit', async () => {
      const result = await runComprehensiveAudit();
      
      const performanceIssues = result.issuesByCategory.performance || [];
      expect(performanceIssues.length).toBeGreaterThan(0);
      
      // Should include the critical bundle size issue
      const bundleIssue = performanceIssues.find(i => i.type === 'bundle-size');
      expect(bundleIssue).toBeDefined();
      expect(bundleIssue?.severity).toBe('critical');
    });
  });

  describe('generateComprehensiveAuditReport', () => {
    it('should generate a markdown report with all required sections', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      // Check for required sections
      expect(report).toContain('# Comprehensive Design Audit Report');
      expect(report).toContain('## Executive Summary');
      expect(report).toContain('## Category Scores Overview');
      expect(report).toContain('## Top 5 Highest-Priority Issues');
      expect(report).toContain('## Detailed Category Analysis');
      expect(report).toContain('## Implementation Roadmap');
      expect(report).toContain('## Tools and Methodology');
      expect(report).toContain('## Next Steps');
    });

    it('should include overall score and issue counts', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      expect(report).toContain(`**Overall Score:** 🟡 ${audit.overallScore}/10`);
      expect(report).toContain(`**Total Issues Found:** ${audit.allIssues.length}`);
    });

    it('should format top issues with priority information', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      // Should contain formatted top issues
      expect(report).toContain('### 1. '); // First top issue
      
      // Should include priority, location, category, description, impact, recommendation
      for (const issue of audit.topIssues.slice(0, 5)) {
        expect(report).toContain(`**Location:** ${issue.location}`);
        expect(report).toContain(`**Category:** ${issue.category.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
        expect(report).toContain(`**Priority Score:** ${issue.priority}/100`);
      }
    });

    it('should include severity breakdown', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      const criticalCount = audit.issuesBySeverity.critical?.length || 0;
      const highCount = audit.issuesBySeverity.high?.length || 0;
      const mediumCount = audit.issuesBySeverity.medium?.length || 0;
      const lowCount = audit.issuesBySeverity.low?.length || 0;
      
      expect(report).toContain(`- 🚨 **Critical:** ${criticalCount} issues`);
      expect(report).toContain(`- 🔴 **High:** ${highCount} issues`);
      expect(report).toContain(`- 🟡 **Medium:** ${mediumCount} issues`);
      expect(report).toContain(`- 🟢 **Low:** ${lowCount} issues`);
    });

    it('should include implementation roadmap with phases', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      expect(report).toContain('### Phase 1: Critical Issues');
      expect(report).toContain('### Phase 2: High Priority');
      expect(report).toContain('### Phase 3: Medium Priority');
      expect(report).toContain('### Phase 4: Low Priority');
    });

    it('should handle empty issue categories gracefully', async () => {
      const audit = await runComprehensiveAudit();
      
      // Simulate empty issues for a category
      const modifiedAudit = { ...audit };
      if (modifiedAudit.issuesByCategory.accessibility) {
        modifiedAudit.issuesByCategory.accessibility = [];
      }
      
      const report = generateComprehensiveAuditReport(modifiedAudit);
      
      expect(report).toContain('✅ No issues found');
      expect(report).not.toContain('undefined');
    });

    it('should format scores with appropriate icons', async () => {
      const audit = await runComprehensiveAudit();
      const report = generateComprehensiveAuditReport(audit);
      
      // Check for score formatting with icons
      if (audit.overallScore >= 9) {
        expect(report).toContain('🟢');
      } else if (audit.overallScore >= 7) {
        expect(report).toContain('🟡');
      } else if (audit.overallScore >= 5) {
        expect(report).toContain('🟠');
      } else {
        expect(report).toContain('🔴');
      }
    });
  });

  describe('Issue Analysis Functions', () => {
    it('should calculate priority correctly based on severity and category', async () => {
      const result = await runComprehensiveAudit();
      
      const criticalAccessibility = result.allIssues.find(i => 
        i.severity === 'critical' && i.category === 'accessibility'
      );
      const criticalPerformance = result.allIssues.find(i => 
        i.severity === 'critical' && i.category === 'performance'
      );
      
      // Accessibility should have higher priority than performance for same severity
      if (criticalAccessibility && criticalPerformance) {
        expect(criticalAccessibility.priority).toBeGreaterThan(criticalPerformance.priority);
      }
    });

    it('should infer issue types from descriptions', async () => {
      const result = await runComprehensiveAudit();
      
      const contrastIssue = result.allIssues.find(i => i.description.includes('contrast'));
      if (contrastIssue) {
        expect(contrastIssue.type).toBe('contrast');
      }
      
      const bundleIssue = result.allIssues.find(i => i.description.includes('bundle'));
      if (bundleIssue) {
        expect(bundleIssue.type).toBe('bundle-size');
      }
    });

    it('should generate appropriate impact descriptions', async () => {
      const result = await runComprehensiveAudit();
      
      // All issues should have meaningful impact descriptions
      for (const issue of result.allIssues) {
        expect(issue.impact).toBeTruthy();
        expect(issue.impact.length).toBeGreaterThan(10); // Should be descriptive
        // Should describe impact on users, site, or functionality
        expect(issue.impact).toMatch(/user|experience|usability|accessibility|performance|site|load|read|interact|difficult/i);
      }
    });

    it('should infer locations from descriptions', async () => {
      const result = await runComprehensiveAudit();
      
      // All issues should have location information
      for (const issue of result.allIssues) {
        expect(issue.location).toBeTruthy();
        expect(issue.location).not.toBe('');
      }
    });
  });
});