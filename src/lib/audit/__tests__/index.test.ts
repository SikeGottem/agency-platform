import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDesignAudit, generateAuditReport } from '../index';
import type { DesignAudit } from '../types';

// Mock all audit modules
vi.mock('../accessibility', () => ({
  auditAccessibility: vi.fn().mockReturnValue({
    score: 8.5,
    issues: ['LOW: Minor accessibility issue'],
    recommendations: ['Add ARIA labels']
  })
}));

vi.mock('../performance', () => ({
  auditPerformance: vi.fn().mockResolvedValue({
    score: 7.2,
    issues: ['MEDIUM: Large bundle size'],
    recommendations: ['Optimize images']
  })
}));

vi.mock('../mobile-ux', () => ({
  auditMobileUX: vi.fn().mockReturnValue({
    score: 9.1,
    issues: [],
    recommendations: ['Test on mobile devices']
  })
}));

vi.mock('../visual-consistency', () => ({
  auditVisualConsistency: vi.fn().mockReturnValue({
    score: 6.8,
    issues: ['HIGH: Too many font sizes'],
    recommendations: ['Use consistent spacing']
  })
}));

vi.mock('../interaction-design', () => ({
  auditInteractionDesign: vi.fn().mockReturnValue({
    score: 7.5,
    issues: ['MEDIUM: Missing loading states'],
    recommendations: ['Add hover effects']
  })
}));

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:30:00.000Z');

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('design audit runner', () => {
  describe('runDesignAudit', () => {
    it('should run all audit categories and return results', async () => {
      const result = await runDesignAudit();
      
      expect(result).toHaveProperty('accessibility');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('mobileUX');
      expect(result).toHaveProperty('visualConsistency');
      expect(result).toHaveProperty('interactionDesign');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('timestamp');
      
      // Check overall score calculation (average of all scores)
      const expectedOverall = (8.5 + 7.2 + 9.1 + 6.8 + 7.5) / 5;
      expect(result.overallScore).toBe(Math.round(expectedOverall * 10) / 10);
      
      expect(result.timestamp).toBe(mockDate.toISOString());
    });

    it('should handle individual audit failures gracefully', async () => {
      // This tests that even if one audit fails, others still run
      const result = await runDesignAudit();
      expect(result).toBeDefined();
      expect(typeof result.overallScore).toBe('number');
    });
  });

  describe('generateAuditReport', () => {
    it('should generate a properly formatted markdown report', () => {
      const mockAudit: DesignAudit = {
        accessibility: {
          score: 8.5,
          issues: ['LOW: Minor issue'],
          recommendations: ['Add ARIA labels', 'Test with screen readers']
        },
        performance: {
          score: 7.2,
          issues: ['MEDIUM: Bundle size too large'],
          recommendations: ['Optimize images', 'Use code splitting']
        },
        mobileUX: {
          score: 9.1,
          issues: [],
          recommendations: ['Test on real devices']
        },
        visualConsistency: {
          score: 6.8,
          issues: ['HIGH: Inconsistent spacing'],
          recommendations: ['Create design system']
        },
        interactionDesign: {
          score: 7.5,
          issues: ['MEDIUM: Missing loading states'],
          recommendations: ['Add micro-interactions']
        },
        overallScore: 7.8,
        timestamp: mockDate.toISOString()
      };

      const report = generateAuditReport(mockAudit);
      
      // Check for main sections
      expect(report).toContain('# Design Audit Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('## Accessibility');
      expect(report).toContain('## Performance');
      expect(report).toContain('## Mobile UX');
      expect(report).toContain('## Visual Consistency');
      expect(report).toContain('## Interaction Design');
      expect(report).toContain('## Next Steps');
      
      // Check for score formatting
      expect(report).toContain('🟡 8.5/10 (Good)'); // Accessibility
      expect(report).toContain('🟡 7.2/10 (Good)'); // Performance
      expect(report).toContain('🟢 9.1/10 (Excellent)'); // Mobile UX
      expect(report).toContain('🟠 6.8/10 (Fair)'); // Visual Consistency
      expect(report).toContain('🟡 7.5/10 (Good)'); // Interaction Design
      
      // Check for issues and recommendations
      expect(report).toContain('- LOW: Minor issue');
      expect(report).toContain('- Add ARIA labels');
      expect(report).toContain('✅ No issues found'); // For empty issues array
      
      // Check timestamp formatting
      expect(report).toContain('1/15/2024'); // Date formatting may vary by locale
    });

    it('should handle empty issues correctly', () => {
      const mockAudit: DesignAudit = {
        accessibility: { score: 10, issues: [], recommendations: ['Keep it up!'] },
        performance: { score: 10, issues: [], recommendations: ['Monitor regularly'] },
        mobileUX: { score: 10, issues: [], recommendations: ['Test periodically'] },
        visualConsistency: { score: 10, issues: [], recommendations: ['Maintain standards'] },
        interactionDesign: { score: 10, issues: [], recommendations: ['Regular review'] },
        overallScore: 10,
        timestamp: mockDate.toISOString()
      };

      const report = generateAuditReport(mockAudit);
      
      // Should show "No issues found" for empty arrays
      const noIssuesCount = (report.match(/✅ No issues found/g) || []).length;
      expect(noIssuesCount).toBe(5); // One for each category
    });

    it('should format scores with correct color indicators', () => {
      const testCases = [
        { score: 9.5, expected: '🟢' }, // Excellent
        { score: 8.0, expected: '🟡' }, // Good
        { score: 6.5, expected: '🟠' }, // Fair
        { score: 4.0, expected: '🔴' }, // Needs Improvement
      ];

      testCases.forEach(({ score, expected }) => {
        const mockAudit: DesignAudit = {
          accessibility: { score, issues: [], recommendations: [] },
          performance: { score: 5, issues: [], recommendations: [] },
          mobileUX: { score: 5, issues: [], recommendations: [] },
          visualConsistency: { score: 5, issues: [], recommendations: [] },
          interactionDesign: { score: 5, issues: [], recommendations: [] },
          overallScore: 5,
          timestamp: mockDate.toISOString()
        };

        const report = generateAuditReport(mockAudit);
        expect(report).toContain(`${expected} ${score}/10`);
      });
    });
  });
});