import type { AuditScore } from './types';

interface VisualIssue {
  type: 'spacing' | 'typography' | 'color' | 'layout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

/**
 * Analyzes spacing consistency across the page
 */
export function analyzeSpacing(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const elements = document.querySelectorAll('*');
    const marginValues = new Set<number>();
    const paddingValues = new Set<number>();
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      // Collect margin values
      ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].forEach(prop => {
        const value = parseFloat(styles.getPropertyValue(prop));
        if (value > 0) marginValues.add(value);
      });
      
      // Collect padding values
      ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].forEach(prop => {
        const value = parseFloat(styles.getPropertyValue(prop));
        if (value > 0) paddingValues.add(value);
      });
    });
    
    // Check for too many different spacing values (suggests inconsistent spacing system)
    if (marginValues.size > 12) {
      issues.push({
        type: 'spacing',
        severity: 'medium',
        description: `Found ${marginValues.size} different margin values (suggests inconsistent spacing system)`,
        recommendation: 'Use a consistent spacing scale (e.g., 4px, 8px, 16px, 24px, 32px, 48px)'
      });
    }
    
    if (paddingValues.size > 12) {
      issues.push({
        type: 'spacing',
        severity: 'medium',
        description: `Found ${paddingValues.size} different padding values (suggests inconsistent spacing system)`,
        recommendation: 'Use a consistent spacing scale (e.g., 4px, 8px, 16px, 24px, 32px, 48px)'
      });
    }
    
    // Check for odd spacing values that don't follow common scales
    const commonScale = [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64];
    const oddMargins = Array.from(marginValues).filter(value => 
      !commonScale.some(scale => Math.abs(value - scale) < 2)
    );
    
    if (oddMargins.length > 0) {
      issues.push({
        type: 'spacing',
        severity: 'low',
        description: `Found unusual margin values: ${oddMargins.slice(0, 5).join(', ')}px`,
        recommendation: 'Align spacing values to a consistent scale for better visual rhythm'
      });
    }
  }
  
  return issues;
}

/**
 * Analyzes typography consistency
 */
export function analyzeTypography(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, input, textarea, li');
    const fontSizes = new Set<number>();
    const fontFamilies = new Set<string>();
    const lineHeights = new Set<number>();
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      fontSizes.add(parseFloat(styles.fontSize));
      fontFamilies.add(styles.fontFamily);
      
      const lineHeight = styles.lineHeight;
      if (lineHeight !== 'normal' && !lineHeight.includes('%')) {
        lineHeights.add(parseFloat(lineHeight));
      }
    });
    
    // Check for too many font sizes
    if (fontSizes.size > 8) {
      issues.push({
        type: 'typography',
        severity: 'medium',
        description: `Found ${fontSizes.size} different font sizes (suggests inconsistent typography scale)`,
        recommendation: 'Use a consistent typographic scale (e.g., 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px)'
      });
    }
    
    // Check for too many font families
    if (fontFamilies.size > 3) {
      issues.push({
        type: 'typography',
        severity: 'high',
        description: `Found ${fontFamilies.size} different font families (too many for visual consistency)`,
        recommendation: 'Limit to 1-2 font families maximum (one for headers, one for body text)'
      });
    }
    
    // Check for inconsistent line heights
    if (lineHeights.size > 4) {
      issues.push({
        type: 'typography',
        severity: 'low',
        description: `Found ${lineHeights.size} different line height values`,
        recommendation: 'Use consistent line height values (e.g., 1.2 for headers, 1.5-1.6 for body text)'
      });
    }
    
    // Check for headings without proper hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyIssues = 0;
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (level > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = level;
    });
    
    if (hierarchyIssues > 0) {
      issues.push({
        type: 'typography',
        severity: 'medium',
        description: 'Heading hierarchy has gaps (e.g., H1 followed directly by H3)',
        recommendation: 'Maintain proper heading hierarchy (H1 → H2 → H3, etc.)'
      });
    }
  }
  
  return issues;
}

/**
 * Analyzes color palette consistency
 */
export function analyzeColorPalette(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  
  if (typeof window !== 'undefined') {
    const elements = document.querySelectorAll('*');
    const colors = new Set<string>();
    const backgroundColors = new Set<string>();
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        colors.add(color);
      }
      
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        backgroundColors.add(backgroundColor);
      }
    });
    
    // Check for too many colors
    if (colors.size > 12) {
      issues.push({
        type: 'color',
        severity: 'medium',
        description: `Found ${colors.size} different text colors (suggests inconsistent color system)`,
        recommendation: 'Use a limited color palette with semantic color names (primary, secondary, success, warning, error)'
      });
    }
    
    if (backgroundColors.size > 8) {
      issues.push({
        type: 'color',
        severity: 'medium',
        description: `Found ${backgroundColors.size} different background colors`,
        recommendation: 'Limit background colors to essential ones (primary, secondary, neutral shades)'
      });
    }
    
    // Check for similar but not identical colors (color inconsistency)
    const colorArray = Array.from(colors);
    let similarColors = 0;
    
    for (let i = 0; i < colorArray.length - 1; i++) {
      for (let j = i + 1; j < colorArray.length; j++) {
        // This is a simplified check - would need better color distance calculation
        if (colorArray[i].includes('rgb') && colorArray[j].includes('rgb')) {
          const color1Values = colorArray[i].match(/\d+/g) || [];
          const color2Values = colorArray[j].match(/\d+/g) || [];
          
          if (color1Values.length >= 3 && color2Values.length >= 3) {
            const distance = Math.sqrt(
              Math.pow(parseInt(color1Values[0]) - parseInt(color2Values[0]), 2) +
              Math.pow(parseInt(color1Values[1]) - parseInt(color2Values[1]), 2) +
              Math.pow(parseInt(color1Values[2]) - parseInt(color2Values[2]), 2)
            );
            
            // Colors are similar but not identical
            if (distance < 30 && distance > 0) {
              similarColors++;
            }
          }
        }
      }
    }
    
    if (similarColors > 3) {
      issues.push({
        type: 'color',
        severity: 'low',
        description: `Found ${similarColors} pairs of similar but not identical colors`,
        recommendation: 'Consolidate similar colors into a consistent color palette'
      });
    }
  }
  
  return issues;
}

/**
 * Analyzes layout consistency
 */
export function analyzeLayout(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check for inconsistent container widths
    const containers = document.querySelectorAll('div, section, article, main');
    const maxWidths = new Set<number>();
    
    containers.forEach((container) => {
      const styles = window.getComputedStyle(container as HTMLElement);
      const maxWidth = styles.maxWidth;
      
      if (maxWidth && maxWidth !== 'none' && maxWidth.includes('px')) {
        maxWidths.add(parseFloat(maxWidth));
      }
    });
    
    if (maxWidths.size > 4) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Found ${maxWidths.size} different max-width values for containers`,
        recommendation: 'Use consistent container widths (e.g., 320px, 768px, 1024px, 1280px)'
      });
    }
    
    // Check for inconsistent grid/flex layouts
    const layoutElements = document.querySelectorAll('*');
    let gridCount = 0;
    let flexCount = 0;
    
    layoutElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const display = styles.display;
      
      if (display.includes('grid')) gridCount++;
      if (display.includes('flex')) flexCount++;
    });
    
    // If both grid and flex are used extensively, suggest consistency
    if (gridCount > 5 && flexCount > 5) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: 'Both CSS Grid and Flexbox are used extensively',
        recommendation: 'Consider standardizing on one layout method where possible for consistency'
      });
    }
  }
  
  return issues;
}

/**
 * Runs a comprehensive visual consistency audit
 */
export function auditVisualConsistency(): AuditScore {
  const issues: VisualIssue[] = [];
  const recommendations: string[] = [];
  
  // Collect all visual consistency issues
  issues.push(...analyzeSpacing());
  issues.push(...analyzeTypography());
  issues.push(...analyzeColorPalette());
  issues.push(...analyzeLayout());
  
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
  recommendations.push('Create and document a design system with consistent spacing, typography, and color scales');
  recommendations.push('Use CSS custom properties (variables) for consistent values');
  recommendations.push('Implement a typography scale with defined font sizes and line heights');
  recommendations.push('Establish a limited color palette with semantic naming');
  recommendations.push('Use consistent spacing values based on a modular scale (e.g., 4px base)');
  recommendations.push('Create reusable component library for consistent UI patterns');
  
  return {
    score: Math.round(score * 10) / 10,
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations
  };
}