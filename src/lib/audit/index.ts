import type { DesignAudit, AccessibilityIssue, PerformanceIssue, MobileUXIssue } from './types';
import { auditAccessibilitySync } from './accessibility';
import { auditPerformance } from './performance';
import { auditMobileUX } from './mobile-ux';
import { auditVisualConsistency } from './visual-consistency';
import { auditInteractionDesign } from './interaction-design';

// Enhanced types for comprehensive reporting
interface ComprehensiveIssue {
  id: string;
  category: 'accessibility' | 'performance' | 'mobile-ux' | 'visual-consistency' | 'interaction-design';
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number; // 1-100, higher = more urgent
  location: string;
  description: string;
  impact: string;
  recommendation: string;
}

interface ComprehensiveAudit extends DesignAudit {
  allIssues: ComprehensiveIssue[];
  topIssues: ComprehensiveIssue[];
  issuesByCategory: Record<string, ComprehensiveIssue[]>;
  issuesBySeverity: Record<string, ComprehensiveIssue[]>;
}

/**
 * Runs a complete design audit of the current page
 */
export async function runDesignAudit(): Promise<DesignAudit> {
  // Run all audit categories
  const accessibility = auditAccessibilitySync();
  const performance = await auditPerformance();
  const mobileUX = auditMobileUX();
  const visualConsistency = auditVisualConsistency();
  const interactionDesign = auditInteractionDesign();
  
  // Calculate overall score
  const scores = [
    accessibility.score,
    performance.score.score || performance.score,
    mobileUX.score,
    visualConsistency.score,
    interactionDesign.score
  ];
  
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  return {
    accessibility,
    performance: performance.score || performance,
    mobileUX,
    visualConsistency,
    interactionDesign,
    overallScore: Math.round(overallScore * 10) / 10,
    timestamp: new Date().toISOString()
  };
}

/**
 * Runs a comprehensive design audit with detailed issue analysis
 */
export async function runComprehensiveAudit(): Promise<ComprehensiveAudit> {
  // Run all audits
  const basicAudit = await runDesignAudit();
  const performanceDetails = await auditPerformance();
  
  // Collect all structured issues
  const allIssues: ComprehensiveIssue[] = [];
  
  // Process accessibility issues (would need to extract from actual functions)
  // For now, parse from existing audit results
  parseAuditIssues(basicAudit.accessibility, 'accessibility', allIssues);
  
  // Process performance issues
  if (performanceDetails.dashboardIssues) {
    performanceDetails.dashboardIssues.forEach((issue, index) => {
      allIssues.push({
        id: `perf-${index}`,
        category: 'performance',
        type: issue.type,
        severity: issue.severity,
        priority: calculatePriority(issue.severity, 'performance'),
        location: 'Dashboard',
        description: issue.description,
        impact: generateImpactDescription(issue.type, issue.severity),
        recommendation: issue.recommendation
      });
    });
  }
  
  // Process other category issues
  parseAuditIssues(basicAudit.mobileUX, 'mobile-ux', allIssues);
  parseAuditIssues(basicAudit.visualConsistency, 'visual-consistency', allIssues);
  parseAuditIssues(basicAudit.interactionDesign, 'interaction-design', allIssues);
  
  // Sort issues by priority
  allIssues.sort((a, b) => b.priority - a.priority);
  
  // Get top 5 issues
  const topIssues = allIssues.slice(0, 5);
  
  // Group issues by category and severity
  const issuesByCategory = allIssues.reduce((groups, issue) => {
    if (!groups[issue.category]) groups[issue.category] = [];
    groups[issue.category].push(issue);
    return groups;
  }, {} as Record<string, ComprehensiveIssue[]>);
  
  const issuesBySeverity = allIssues.reduce((groups, issue) => {
    if (!groups[issue.severity]) groups[issue.severity] = [];
    groups[issue.severity].push(issue);
    return groups;
  }, {} as Record<string, ComprehensiveIssue[]>);
  
  return {
    ...basicAudit,
    allIssues,
    topIssues,
    issuesByCategory,
    issuesBySeverity
  };
}

/**
 * Helper function to parse audit results into structured issues
 */
function parseAuditIssues(auditResult: any, category: string, allIssues: ComprehensiveIssue[]): void {
  if (!auditResult.issues) return;
  
  auditResult.issues.forEach((issueStr: string, index: number) => {
    const [severityPart, ...descriptionParts] = issueStr.split(': ');
    const severity = severityPart.toLowerCase() as 'low' | 'medium' | 'high' | 'critical';
    const description = descriptionParts.join(': ');
    
    allIssues.push({
      id: `${category}-${index}`,
      category: category as any,
      type: inferIssueType(description),
      severity,
      priority: calculatePriority(severity, category),
      location: inferLocation(description),
      description,
      impact: generateImpactDescription(inferIssueType(description), severity),
      recommendation: findRecommendation(auditResult.recommendations, description)
    });
  });
}

/**
 * Calculate priority score based on severity and category
 */
function calculatePriority(severity: string, category: string): number {
  const severityWeights = { critical: 100, high: 75, medium: 50, low: 25 };
  const categoryWeights = { 
    accessibility: 1.0, 
    performance: 0.9, 
    'mobile-ux': 0.8, 
    'visual-consistency': 0.6, 
    'interaction-design': 0.7 
  };
  
  const base = severityWeights[severity as keyof typeof severityWeights] || 25;
  const multiplier = categoryWeights[category as keyof typeof categoryWeights] || 0.5;
  
  return Math.round(base * multiplier);
}

/**
 * Infer issue type from description
 */
function inferIssueType(description: string): string {
  const patterns = [
    { pattern: /contrast/i, type: 'contrast' },
    { pattern: /keyboard/i, type: 'keyboard-navigation' },
    { pattern: /aria|alt|label/i, type: 'aria' },
    { pattern: /focus/i, type: 'focus-indicators' },
    { pattern: /image|img/i, type: 'image-optimization' },
    { pattern: /bundle|size|load/i, type: 'bundle-size' },
    { pattern: /touch|tap/i, type: 'touch-targets' },
    { pattern: /responsive|mobile/i, type: 'responsive' },
    { pattern: /font|text/i, type: 'font-size' },
    { pattern: /color|spacing|typography/i, type: 'visual-consistency' },
    { pattern: /loading|error|interaction/i, type: 'interaction-design' }
  ];
  
  for (const { pattern, type } of patterns) {
    if (pattern.test(description)) return type;
  }
  
  return 'general';
}

/**
 * Infer location from description
 */
function inferLocation(description: string): string {
  const patterns = [
    { pattern: /dashboard/i, location: 'Dashboard' },
    { pattern: /header/i, location: 'Header' },
    { pattern: /footer/i, location: 'Footer' },
    { pattern: /navigation|nav/i, location: 'Navigation' },
    { pattern: /form/i, location: 'Forms' },
    { pattern: /button/i, location: 'Buttons' },
    { pattern: /image|img/i, location: 'Images' }
  ];
  
  for (const { pattern, location } of patterns) {
    if (pattern.test(description)) return location;
  }
  
  return 'General';
}

/**
 * Generate impact description based on issue type and severity
 */
function generateImpactDescription(type: string, severity: string): string {
  const impacts = {
    contrast: {
      critical: 'Users with visual impairments cannot read content',
      high: 'Text is difficult to read for many users',
      medium: 'Some users may struggle to read content',
      low: 'Minor readability issues for some users'
    },
    'keyboard-navigation': {
      critical: 'Site is completely inaccessible to keyboard users',
      high: 'Key functionality unavailable to keyboard users',
      medium: 'Navigation is difficult for keyboard users',
      low: 'Minor keyboard usability issues'
    },
    'bundle-size': {
      critical: 'Site fails to load on slow connections',
      high: 'Significant loading delays for most users',
      medium: 'Noticeable performance impact',
      low: 'Minor performance degradation'
    },
    'touch-targets': {
      critical: 'Mobile users cannot interact with key elements',
      high: 'Difficult mobile interaction reduces usability',
      medium: 'Some mobile users experience interaction issues',
      low: 'Minor mobile usability concerns'
    }
  };
  
  return impacts[type as keyof typeof impacts]?.[severity as keyof typeof impacts[typeof type]] || 
         `${severity.charAt(0).toUpperCase() + severity.slice(1)} impact on user experience`;
}

/**
 * Find matching recommendation for an issue
 */
function findRecommendation(recommendations: string[], description: string): string {
  const defaultRecs = recommendations.find(rec => 
    rec.toLowerCase().includes(description.toLowerCase().split(' ')[0])
  );
  
  return defaultRecs || recommendations[0] || 'Review and address this issue';
}

/**
 * Generates a comprehensive markdown report from audit results
 */
export function generateComprehensiveAuditReport(audit: ComprehensiveAudit): string {
  const formatScore = (score: number): string => {
    if (score >= 9) return `🟢 ${score}/10 (Excellent)`;
    if (score >= 7) return `🟡 ${score}/10 (Good)`;
    if (score >= 5) return `🟠 ${score}/10 (Fair)`;
    return `🔴 ${score}/10 (Needs Improvement)`;
  };
  
  const formatPriority = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨 Critical';
      case 'high': return '🔴 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return severity;
    }
  };
  
  const formatTopIssues = (issues: ComprehensiveIssue[]): string => {
    if (issues.length === 0) return '✅ No high-priority issues found';
    
    return issues.map((issue, index) => `
### ${index + 1}. ${formatPriority(issue.severity)} - ${issue.type.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Location:** ${issue.location}
**Category:** ${issue.category.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
**Priority Score:** ${issue.priority}/100

**Description:** ${issue.description}

**Impact:** ${issue.impact}

**Recommendation:** ${issue.recommendation}
`).join('\n---\n');
  };
  
  const formatCategoryIssues = (issues: ComprehensiveIssue[]): string => {
    if (issues.length === 0) return '✅ No issues found';
    
    const grouped = issues.reduce((groups, issue) => {
      if (!groups[issue.severity]) groups[issue.severity] = [];
      groups[issue.severity].push(issue);
      return groups;
    }, {} as Record<string, ComprehensiveIssue[]>);
    
    let output = '';
    ['critical', 'high', 'medium', 'low'].forEach(severity => {
      if (grouped[severity]) {
        output += `\n#### ${formatPriority(severity)} Issues\n`;
        grouped[severity].forEach(issue => {
          output += `- **${issue.location}**: ${issue.description}\n`;
        });
      }
    });
    
    return output || '✅ No issues found';
  };
  
  const criticalCount = audit.issuesBySeverity.critical?.length || 0;
  const highCount = audit.issuesBySeverity.high?.length || 0;
  const mediumCount = audit.issuesBySeverity.medium?.length || 0;
  const lowCount = audit.issuesBySeverity.low?.length || 0;
  
  return `# Comprehensive Design Audit Report

**Generated:** ${new Date(audit.timestamp).toLocaleString()}
**Overall Score:** ${formatScore(audit.overallScore)}
**Total Issues Found:** ${audit.allIssues.length}

## Executive Summary

This comprehensive design audit evaluated the agency platform across five key categories: Accessibility, Performance, Mobile UX, Visual Consistency, and Interaction Design. The audit identified **${audit.allIssues.length} total issues** across all categories, with **${audit.topIssues.length} high-priority items** requiring immediate attention.

### Issue Breakdown by Severity
- 🚨 **Critical:** ${criticalCount} issues
- 🔴 **High:** ${highCount} issues  
- 🟡 **Medium:** ${mediumCount} issues
- 🟢 **Low:** ${lowCount} issues

## Category Scores Overview

| Category | Score | Status | Issues Found |
|----------|-------|--------|--------------|
| Accessibility | ${audit.accessibility.score}/10 | ${audit.accessibility.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} | ${audit.issuesByCategory.accessibility?.length || 0} |
| Performance | ${audit.performance.score}/10 | ${audit.performance.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} | ${audit.issuesByCategory.performance?.length || 0} |
| Mobile UX | ${audit.mobileUX.score}/10 | ${audit.mobileUX.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} | ${audit.issuesByCategory['mobile-ux']?.length || 0} |
| Visual Consistency | ${audit.visualConsistency.score}/10 | ${audit.visualConsistency.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} | ${audit.issuesByCategory['visual-consistency']?.length || 0} |
| Interaction Design | ${audit.interactionDesign.score}/10 | ${audit.interactionDesign.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} | ${audit.issuesByCategory['interaction-design']?.length || 0} |

## Top 5 Highest-Priority Issues

These are the most critical issues that should be addressed first based on severity, user impact, and business importance:

${formatTopIssues(audit.topIssues)}

---

## Detailed Category Analysis

### Accessibility ${formatScore(audit.accessibility.score)}

Accessibility ensures the platform is usable by people with disabilities and meets WCAG standards.

${formatCategoryIssues(audit.issuesByCategory.accessibility || [])}

**Key Recommendations:**
${audit.accessibility.recommendations.map(rec => `- ${rec}`).join('\n')}

---

### Performance ${formatScore(audit.performance.score)}

Performance analysis focuses on loading speed, Core Web Vitals, and optimization opportunities.

${formatCategoryIssues(audit.issuesByCategory.performance || [])}

**Key Recommendations:**
${audit.performance.recommendations.map(rec => `- ${rec}`).join('\n')}

---

### Mobile UX ${formatScore(audit.mobileUX.score)}

Mobile user experience evaluation covering touch targets, responsive design, and mobile-specific usability.

${formatCategoryIssues(audit.issuesByCategory['mobile-ux'] || [])}

**Key Recommendations:**
${audit.mobileUX.recommendations.map(rec => `- ${rec}`).join('\n')}

---

### Visual Consistency ${formatScore(audit.visualConsistency.score)}

Visual consistency analysis of spacing systems, typography, color usage, and design patterns.

${formatCategoryIssues(audit.issuesByCategory['visual-consistency'] || [])}

**Key Recommendations:**
${audit.visualConsistency.recommendations.map(rec => `- ${rec}`).join('\n')}

---

### Interaction Design ${formatScore(audit.interactionDesign.score)}

Interaction design evaluation covering loading states, error handling, micro-interactions, and user feedback.

${formatCategoryIssues(audit.issuesByCategory['interaction-design'] || [])}

**Key Recommendations:**
${audit.interactionDesign.recommendations.map(rec => `- ${rec}`).join('\n')}

---

## Implementation Roadmap

### Phase 1: Critical Issues (Immediate - Week 1)
${criticalCount > 0 ? 
  audit.issuesBySeverity.critical.map(issue => `- ${issue.description}`).join('\n') :
  '✅ No critical issues to address'}

### Phase 2: High Priority (Week 2-3)
${highCount > 0 ? 
  audit.issuesBySeverity.high.map(issue => `- ${issue.description}`).join('\n') :
  '✅ No high priority issues to address'}

### Phase 3: Medium Priority (Month 2)
${mediumCount > 0 ? 
  audit.issuesBySeverity.medium.slice(0, 5).map(issue => `- ${issue.description}`).join('\n') + (mediumCount > 5 ? `\n- And ${mediumCount - 5} more medium priority issues` : '') :
  '✅ No medium priority issues to address'}

### Phase 4: Low Priority (Ongoing)
${lowCount > 0 ? 
  `${lowCount} low priority issues for continuous improvement` :
  '✅ No low priority issues to address'}

## Tools and Methodology

This audit was conducted using:
- **Custom Audit Framework**: Comprehensive analysis tools built specifically for this platform
- **Browser APIs**: Performance Observer, Intersection Observer, DOM analysis
- **Accessibility Testing**: axe-core integration, WCAG 2.1 AA compliance checks
- **Performance Monitoring**: Core Web Vitals, Lighthouse metrics, bundle analysis
- **Mobile Testing**: Responsive design validation, touch target analysis
- **Visual Analysis**: CSS property extraction, design pattern consistency checks

## Next Steps

1. **Review and Prioritize**: Stakeholders should review the top 5 issues and Phase 1 critical items
2. **Create Tickets**: Break down issues into actionable development tasks
3. **Implement Fixes**: Address issues in order of priority
4. **Re-test**: Validate fixes and run focused audits on changed areas
5. **Monitor**: Set up ongoing monitoring for performance and accessibility metrics

---

*This comprehensive audit provides a foundation for systematic design improvements. Regular audits (monthly/quarterly) are recommended to maintain high standards and catch regressions early.*`;
}

/**
 * Legacy function for backward compatibility
 */
export function generateAuditReport(audit: DesignAudit): string {
  // For basic reports, use the existing simple format
  const formatScore = (score: number): string => {
    if (score >= 9) return `🟢 ${score}/10 (Excellent)`;
    if (score >= 7) return `🟡 ${score}/10 (Good)`;
    if (score >= 5) return `🟠 ${score}/10 (Fair)`;
    return `🔴 ${score}/10 (Needs Improvement)`;
  };
  
  const formatIssues = (issues: string[]): string => {
    if (issues.length === 0) return '✅ No issues found';
    return issues.map(issue => `- ${issue}`).join('\n');
  };
  
  const formatRecommendations = (recommendations: string[]): string => {
    return recommendations.map(rec => `- ${rec}`).join('\n');
  };
  
  return `# Design Audit Report
  
**Generated:** ${new Date(audit.timestamp).toLocaleString()}
**Overall Score:** ${formatScore(audit.overallScore)}

## Summary

| Category | Score | Status |
|----------|-------|--------|
| Accessibility | ${audit.accessibility.score}/10 | ${audit.accessibility.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} |
| Performance | ${audit.performance.score}/10 | ${audit.performance.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} |
| Mobile UX | ${audit.mobileUX.score}/10 | ${audit.mobileUX.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} |
| Visual Consistency | ${audit.visualConsistency.score}/10 | ${audit.visualConsistency.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} |
| Interaction Design | ${audit.interactionDesign.score}/10 | ${audit.interactionDesign.score >= 7 ? '✅ Good' : '⚠️ Needs Work'} |

## Accessibility ${formatScore(audit.accessibility.score)}

### Issues Found
${formatIssues(audit.accessibility.issues)}

### Recommendations
${formatRecommendations(audit.accessibility.recommendations)}

---

## Performance ${formatScore(audit.performance.score)}

### Issues Found
${formatIssues(audit.performance.issues)}

### Recommendations
${formatRecommendations(audit.performance.recommendations)}

---

## Mobile UX ${formatScore(audit.mobileUX.score)}

### Issues Found
${formatIssues(audit.mobileUX.issues)}

### Recommendations
${formatRecommendations(audit.mobileUX.recommendations)}

---

## Visual Consistency ${formatScore(audit.visualConsistency.score)}

### Issues Found
${formatIssues(audit.visualConsistency.issues)}

### Recommendations
${formatRecommendations(audit.visualConsistency.recommendations)}

---

## Interaction Design ${formatScore(audit.interactionDesign.score)}

### Issues Found
${formatIssues(audit.interactionDesign.issues)}

### Recommendations
${formatRecommendations(audit.interactionDesign.recommendations)}

---

## Next Steps

1. **Priority 1 (Critical)**: Address any issues marked as CRITICAL
2. **Priority 2 (High)**: Fix HIGH severity issues that impact user experience
3. **Priority 3 (Medium)**: Improve MEDIUM severity issues for better consistency
4. **Priority 4 (Low)**: Polish LOW severity issues when time permits

## Tools Used

- Custom audit utilities for comprehensive design analysis
- Browser APIs for performance and accessibility checks
- CSS analysis for visual consistency
- DOM inspection for mobile UX and interactions

*This audit was generated automatically. For more detailed analysis, consider running specialized tools like axe-core, Lighthouse, and manual testing.*`;
}

// Re-export types and utilities
export * from './types';
export * from './accessibility';
export * from './accessibility-scanner';
export * from './performance';
export * from './mobile-ux';
export * from './visual-consistency';
export * from './interaction-design';