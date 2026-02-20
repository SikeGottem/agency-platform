export interface AuditScore {
  score: number; // 1-10
  issues: string[];
  recommendations: string[];
}

export interface DesignAudit {
  accessibility: AuditScore;
  performance: AuditScore;
  mobileUX: AuditScore;
  visualConsistency: AuditScore;
  interactionDesign: AuditScore;
  overallScore: number;
  timestamp: string;
}

export interface AccessibilityIssue {
  type: 'contrast' | 'keyboard-navigation' | 'aria' | 'focus-indicators' | 'alt-text' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element?: string;
  description: string;
  recommendation: string;
  page?: string; // Which page this issue was found on
}

export interface PerformanceIssue {
  type: 'image-optimization' | 'bundle-size' | 'core-web-vitals' | 'loading-time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric?: string;
  currentValue?: number | string;
  targetValue?: number | string;
  description: string;
  recommendation: string;
}

export interface MobileUXIssue {
  type: 'touch-targets' | 'responsive' | 'horizontal-scroll' | 'font-size';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element?: string;
  description: string;
  recommendation: string;
}