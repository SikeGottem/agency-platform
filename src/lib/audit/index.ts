import type { DesignAudit } from './types';
import { auditAccessibility } from './accessibility';
import { auditPerformance } from './performance';
import { auditMobileUX } from './mobile-ux';
import { auditVisualConsistency } from './visual-consistency';
import { auditInteractionDesign } from './interaction-design';

/**
 * Runs a complete design audit of the current page
 */
export async function runDesignAudit(): Promise<DesignAudit> {
  // Run all audit categories
  const accessibility = auditAccessibility();
  const performance = await auditPerformance();
  const mobileUX = auditMobileUX();
  const visualConsistency = auditVisualConsistency();
  const interactionDesign = auditInteractionDesign();
  
  // Calculate overall score
  const scores = [
    accessibility.score,
    performance.score,
    mobileUX.score,
    visualConsistency.score,
    interactionDesign.score
  ];
  
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  return {
    accessibility,
    performance,
    mobileUX,
    visualConsistency,
    interactionDesign,
    overallScore: Math.round(overallScore * 10) / 10,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates a markdown report from audit results
 */
export function generateAuditReport(audit: DesignAudit): string {
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
export * from './performance';
export * from './mobile-ux';
export * from './visual-consistency';
export * from './interaction-design';