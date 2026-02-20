import type { AuditScore } from './types';

interface VisualIssue {
  type: 'spacing' | 'typography' | 'color' | 'layout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

interface SpacingValues {
  margins: number[];
  paddings: number[];
  uniqueMargins: Set<number>;
  uniquePaddings: Set<number>;
}

interface TypographyValues {
  fontSizes: number[];
  fontFamilies: string[];
  lineHeights: number[];
  uniqueFontSizes: Set<number>;
  uniqueFontFamilies: Set<string>;
  uniqueLineHeights: Set<number>;
}

interface ColorValues {
  textColors: string[];
  backgroundColors: string[];
  borderColors: string[];
  hexColors: string[];
  hslColors: string[];
  rgbColors: string[];
}

/**
 * Extracts all spacing values from the page
 */
export function extractSpacingValues(): SpacingValues {
  const margins: number[] = [];
  const paddings: number[] = [];
  const uniqueMargins = new Set<number>();
  const uniquePaddings = new Set<number>();
  
  if (typeof window !== 'undefined') {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      // Collect margin values
      ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].forEach(prop => {
        const value = parseFloat(styles.getPropertyValue(prop));
        if (!isNaN(value) && value >= 0) {
          margins.push(value);
          uniqueMargins.add(value);
        }
      });
      
      // Collect padding values
      ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].forEach(prop => {
        const value = parseFloat(styles.getPropertyValue(prop));
        if (!isNaN(value) && value >= 0) {
          paddings.push(value);
          uniquePaddings.add(value);
        }
      });
    });
  }
  
  return {
    margins,
    paddings,
    uniqueMargins,
    uniquePaddings
  };
}

/**
 * Analyzes spacing consistency across the page
 */
export function analyzeSpacing(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  const spacingValues = extractSpacingValues();
  
  // Check for too many different spacing values (suggests inconsistent spacing system)
  if (spacingValues.uniqueMargins.size > 12) {
    issues.push({
      type: 'spacing',
      severity: 'medium',
      description: `Found ${spacingValues.uniqueMargins.size} different margin values: ${Array.from(spacingValues.uniqueMargins).sort((a, b) => a - b).slice(0, 10).join(', ')}${spacingValues.uniqueMargins.size > 10 ? '...' : ''}px`,
      recommendation: 'Use a consistent spacing scale (e.g., 4px, 8px, 16px, 24px, 32px, 48px)'
    });
  }
  
  if (spacingValues.uniquePaddings.size > 12) {
    issues.push({
      type: 'spacing',
      severity: 'medium',
      description: `Found ${spacingValues.uniquePaddings.size} different padding values: ${Array.from(spacingValues.uniquePaddings).sort((a, b) => a - b).slice(0, 10).join(', ')}${spacingValues.uniquePaddings.size > 10 ? '...' : ''}px`,
      recommendation: 'Use a consistent spacing scale (e.g., 4px, 8px, 16px, 24px, 32px, 48px)'
    });
  }
  
  // Check for odd spacing values that don't follow common scales
  const commonScale = [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96];
  const oddMargins = Array.from(spacingValues.uniqueMargins).filter(value => 
    !commonScale.some(scale => Math.abs(value - scale) < 2)
  );
  
  if (oddMargins.length > 3) {
    issues.push({
      type: 'spacing',
      severity: 'low',
      description: `Found ${oddMargins.length} unusual margin values not aligned to common scales: ${oddMargins.slice(0, 5).join(', ')}px`,
      recommendation: 'Align spacing values to a consistent scale for better visual rhythm'
    });
  }
  
  // Check for fractional values (might indicate CSS scaling issues)
  const fractionalMargins = Array.from(spacingValues.uniqueMargins).filter(value => value % 1 !== 0);
  if (fractionalMargins.length > 2) {
    issues.push({
      type: 'spacing',
      severity: 'low',
      description: `Found ${fractionalMargins.length} fractional margin values: ${fractionalMargins.slice(0, 5).join(', ')}px`,
      recommendation: 'Use whole pixel values for crisp, predictable spacing'
    });
  }
  
  return issues;
}

/**
 * Extracts typography values from the page
 */
export function extractTypographyValues(): TypographyValues {
  const fontSizes: number[] = [];
  const fontFamilies: string[] = [];
  const lineHeights: number[] = [];
  const uniqueFontSizes = new Set<number>();
  const uniqueFontFamilies = new Set<string>();
  const uniqueLineHeights = new Set<number>();
  
  if (typeof window !== 'undefined') {
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, input, textarea, li, div');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      const fontSize = parseFloat(styles.fontSize);
      if (!isNaN(fontSize)) {
        fontSizes.push(fontSize);
        uniqueFontSizes.add(fontSize);
      }
      
      const fontFamily = styles.fontFamily;
      if (fontFamily) {
        fontFamilies.push(fontFamily);
        uniqueFontFamilies.add(fontFamily);
      }
      
      const lineHeight = styles.lineHeight;
      if (lineHeight && lineHeight !== 'normal' && !lineHeight.includes('%')) {
        const lhValue = parseFloat(lineHeight);
        if (!isNaN(lhValue)) {
          lineHeights.push(lhValue);
          uniqueLineHeights.add(lhValue);
        }
      }
    });
  }
  
  return {
    fontSizes,
    fontFamilies,
    lineHeights,
    uniqueFontSizes,
    uniqueFontFamilies,
    uniqueLineHeights
  };
}

/**
 * Analyzes typography consistency
 */
export function analyzeTypography(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  const typography = extractTypographyValues();
  
  // Check for too many font sizes
  if (typography.uniqueFontSizes.size > 8) {
    const sortedSizes = Array.from(typography.uniqueFontSizes).sort((a, b) => a - b);
    issues.push({
      type: 'typography',
      severity: 'medium',
      description: `Found ${typography.uniqueFontSizes.size} different font sizes: ${sortedSizes.join(', ')}px`,
      recommendation: 'Use a consistent typographic scale (e.g., 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px)'
    });
  }
  
  // Check for too many font families
  if (typography.uniqueFontFamilies.size > 3) {
    const families = Array.from(typography.uniqueFontFamilies).map(f => f.split(',')[0].replace(/['"]/g, ''));
    issues.push({
      type: 'typography',
      severity: 'high',
      description: `Found ${typography.uniqueFontFamilies.size} different font families: ${families.slice(0, 5).join(', ')}${families.length > 5 ? '...' : ''}`,
      recommendation: 'Limit to 1-2 font families maximum (one for headers, one for body text)'
    });
  }
  
  // Check for inconsistent line heights
  if (typography.uniqueLineHeights.size > 4) {
    const sortedLineHeights = Array.from(typography.uniqueLineHeights).sort((a, b) => a - b);
    issues.push({
      type: 'typography',
      severity: 'low',
      description: `Found ${typography.uniqueLineHeights.size} different line height values: ${sortedLineHeights.slice(0, 8).join(', ')}${sortedLineHeights.length > 8 ? '...' : ''}`,
      recommendation: 'Use consistent line height values (e.g., 1.2 for headers, 1.5-1.6 for body text)'
    });
  }
  
  // Check for headings without proper hierarchy
  if (typeof window !== 'undefined') {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyIssues = 0;
    const problematicHeadings: string[] = [];
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (previousLevel > 0 && level > previousLevel + 1) {
        hierarchyIssues++;
        problematicHeadings.push(`${heading.tagName} after H${previousLevel}`);
      }
      previousLevel = level;
    });
    
    if (hierarchyIssues > 0) {
      issues.push({
        type: 'typography',
        severity: 'medium',
        description: `Heading hierarchy has ${hierarchyIssues} gaps: ${problematicHeadings.slice(0, 3).join(', ')}${problematicHeadings.length > 3 ? '...' : ''}`,
        recommendation: 'Maintain proper heading hierarchy (H1 → H2 → H3, etc.)'
      });
    }
  }
  
  return issues;
}

/**
 * Converts RGB color to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB color to HSL
 */
function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Extracts all color values from the page with hex/hsl conversions
 */
export function extractColorValues(): ColorValues {
  const textColors: string[] = [];
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];
  const hexColors: string[] = [];
  const hslColors: string[] = [];
  const rgbColors: string[] = [];
  
  if (typeof window !== 'undefined') {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      
      // Process text color
      const color = styles.color;
      if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        textColors.push(color);
        processColor(color, { hexColors, hslColors, rgbColors });
      }
      
      // Process background color
      const backgroundColor = styles.backgroundColor;
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        backgroundColors.push(backgroundColor);
        processColor(backgroundColor, { hexColors, hslColors, rgbColors });
      }
      
      // Process border color
      const borderColor = styles.borderColor;
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent' && borderColor !== 'currentcolor') {
        borderColors.push(borderColor);
        processColor(borderColor, { hexColors, hslColors, rgbColors });
      }
    });
  }
  
  return {
    textColors: [...new Set(textColors)],
    backgroundColors: [...new Set(backgroundColors)],
    borderColors: [...new Set(borderColors)],
    hexColors: [...new Set(hexColors)],
    hslColors: [...new Set(hslColors)],
    rgbColors: [...new Set(rgbColors)]
  };
}

function processColor(color: string, collections: { hexColors: string[], hslColors: string[], rgbColors: string[] }) {
  // Process RGB/RGBA colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    
    collections.rgbColors.push(color);
    collections.hexColors.push(rgbToHex(r, g, b));
    collections.hslColors.push(rgbToHsl(r, g, b));
  }
  // Process hex colors
  else if (color.startsWith('#')) {
    collections.hexColors.push(color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    collections.rgbColors.push(`rgb(${r}, ${g}, ${b})`);
    collections.hslColors.push(rgbToHsl(r, g, b));
  }
  // Process HSL colors
  else if (color.startsWith('hsl')) {
    collections.hslColors.push(color);
    // Note: Converting HSL to RGB/Hex would require more complex logic
  }
}

/**
 * Analyzes color palette consistency
 */
export function analyzeColorPalette(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  const colors = extractColorValues();
  
  // Check for too many text colors
  if (colors.textColors.length > 12) {
    const hexList = colors.hexColors.slice(0, 8).join(', ');
    issues.push({
      type: 'color',
      severity: 'medium',
      description: `Found ${colors.textColors.length} different text colors: ${hexList}${colors.hexColors.length > 8 ? '...' : ''}`,
      recommendation: 'Use a limited color palette with semantic color names (primary, secondary, success, warning, error)'
    });
  }
  
  if (colors.backgroundColors.length > 8) {
    const bgHexList = colors.hexColors.filter(hex => 
      colors.backgroundColors.some(bg => bg.includes(hex.replace('#', '')))
    ).slice(0, 6).join(', ');
    issues.push({
      type: 'color',
      severity: 'medium',
      description: `Found ${colors.backgroundColors.length} different background colors: ${bgHexList}${colors.backgroundColors.length > 6 ? '...' : ''}`,
      recommendation: 'Limit background colors to essential ones (primary, secondary, neutral shades)'
    });
  }
  
  // Check for similar but not identical colors (color inconsistency)
  let similarColors = 0;
  for (let i = 0; i < colors.textColors.length - 1; i++) {
    for (let j = i + 1; j < colors.textColors.length; j++) {
      const color1 = colors.textColors[i];
      const color2 = colors.textColors[j];
      
      if (color1.includes('rgb') && color2.includes('rgb')) {
        const color1Values = color1.match(/\d+/g) || [];
        const color2Values = color2.match(/\d+/g) || [];
        
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
  
  // Check for too many unique colors overall
  const totalUniqueColors = new Set([...colors.textColors, ...colors.backgroundColors, ...colors.borderColors]).size;
  if (totalUniqueColors > 20) {
    issues.push({
      type: 'color',
      severity: 'medium',
      description: `Found ${totalUniqueColors} total unique colors across text, background, and borders`,
      recommendation: 'Establish a design system with a limited color palette (8-12 colors maximum)'
    });
  }
  
  return issues;
}

/**
 * Analyzes design pattern consistency across components
 */
export function analyzeDesignPatterns(): VisualIssue[] {
  const issues: VisualIssue[] = [];
  
  if (typeof window !== 'undefined') {
    // Check button styling consistency
    const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
    const buttonStyles = new Set<string>();
    const buttonBorderRadius = new Set<string>();
    const buttonPadding = new Set<string>();
    
    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button as HTMLElement);
      const styleKey = `${styles.backgroundColor}-${styles.color}-${styles.border}`;
      buttonStyles.add(styleKey);
      buttonBorderRadius.add(styles.borderRadius);
      buttonPadding.add(styles.padding);
    });
    
    if (buttonStyles.size > Math.max(3, Math.floor(buttons.length / 3))) {
      issues.push({
        type: 'layout',
        severity: 'medium',
        description: `Found ${buttonStyles.size} different button style combinations across ${buttons.length} buttons`,
        recommendation: 'Standardize button styles with primary, secondary, and tertiary variants'
      });
    }
    
    if (buttonBorderRadius.size > 3 && buttons.length > 1) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Found ${buttonBorderRadius.size} different border-radius values for buttons`,
        recommendation: 'Use consistent border-radius values for all buttons'
      });
    }
    
    // Check form input consistency
    const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea, select');
    const inputBorderStyles = new Set<string>();
    const inputPadding = new Set<string>();
    
    inputs.forEach((input) => {
      const styles = window.getComputedStyle(input as HTMLElement);
      inputBorderStyles.add(styles.border);
      inputPadding.add(styles.padding);
    });
    
    if (inputBorderStyles.size > 2 && inputs.length > 1) {
      issues.push({
        type: 'layout',
        severity: 'medium',
        description: `Found ${inputBorderStyles.size} different border styles for form inputs`,
        recommendation: 'Use consistent border styling for all form inputs'
      });
    }
    
    // Check card/container pattern consistency
    const cards = document.querySelectorAll('[class*="card"], .card, [class*="container"], .container');
    const cardShadows = new Set<string>();
    const cardBorders = new Set<string>();
    const cardBorderRadius = new Set<string>();
    
    cards.forEach((card) => {
      const styles = window.getComputedStyle(card as HTMLElement);
      if (styles.boxShadow !== 'none') cardShadows.add(styles.boxShadow);
      if (styles.border !== 'none' && styles.border !== '0px none rgb(0, 0, 0)') cardBorders.add(styles.border);
      if (styles.borderRadius !== '0px') cardBorderRadius.add(styles.borderRadius);
    });
    
    if (cardShadows.size > 3 && cards.length > 1) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Found ${cardShadows.size} different box-shadow styles for card/container elements`,
        recommendation: 'Use consistent shadow elevation system (e.g., small, medium, large shadows)'
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
    const containerWidths = new Set<number>();
    
    containers.forEach((container) => {
      const styles = window.getComputedStyle(container as HTMLElement);
      const maxWidth = styles.maxWidth;
      const width = styles.width;
      
      if (maxWidth && maxWidth !== 'none' && maxWidth.includes('px')) {
        maxWidths.add(parseFloat(maxWidth));
      }
      
      if (width && width.includes('px') && !width.includes('auto')) {
        containerWidths.add(parseFloat(width));
      }
    });
    
    if (maxWidths.size > 4) {
      const widths = Array.from(maxWidths).sort((a, b) => a - b);
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Found ${maxWidths.size} different max-width values: ${widths.slice(0, 6).join(', ')}px${widths.length > 6 ? '...' : ''}`,
        recommendation: 'Use consistent container widths (e.g., 320px, 768px, 1024px, 1280px)'
      });
    }
    
    // Check for inconsistent grid/flex layouts
    const layoutElements = document.querySelectorAll('*');
    let gridCount = 0;
    let flexCount = 0;
    let floatCount = 0;
    
    layoutElements.forEach((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      const display = styles.display;
      const float = styles.float;
      
      if (display.includes('grid')) gridCount++;
      if (display.includes('flex')) flexCount++;
      if (float !== 'none') floatCount++;
    });
    
    // If both grid and flex are used extensively, suggest consistency
    if (gridCount > 5 && flexCount > 5) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Both CSS Grid (${gridCount} elements) and Flexbox (${flexCount} elements) are used extensively`,
        recommendation: 'Consider standardizing on one layout method where possible for consistency'
      });
    }
    
    // Check for outdated float usage
    if (floatCount > 3) {
      issues.push({
        type: 'layout',
        severity: 'low',
        description: `Found ${floatCount} elements using CSS float for layout`,
        recommendation: 'Consider migrating float-based layouts to modern CSS Grid or Flexbox'
      });
    }
  }
  
  // Add design pattern analysis
  issues.push(...analyzeDesignPatterns());
  
  return issues;
}

/**
 * Generates comprehensive visual consistency recommendations
 */
function generateVisualConsistencyRecommendations(issues: VisualIssue[]): string[] {
  const recommendations: string[] = [];
  const issueTypes = new Set(issues.map(i => i.type));
  
  // Base recommendations
  recommendations.push('Create and document a design system with consistent spacing, typography, and color scales');
  recommendations.push('Use CSS custom properties (variables) for consistent values across the codebase');
  
  // Type-specific recommendations
  if (issueTypes.has('spacing')) {
    recommendations.push('Implement a modular spacing scale (e.g., 4px, 8px, 16px, 24px, 32px, 48px, 64px)');
    recommendations.push('Use consistent spacing utilities or classes instead of arbitrary values');
  }
  
  if (issueTypes.has('typography')) {
    recommendations.push('Establish a typographic scale with defined font sizes, line heights, and font weights');
    recommendations.push('Limit font families to 1-2 maximum (one for headers, one for body text)');
    recommendations.push('Maintain proper heading hierarchy throughout the application');
  }
  
  if (issueTypes.has('color')) {
    recommendations.push('Define a limited color palette with semantic naming (primary, secondary, success, warning, error)');
    recommendations.push('Use HSL color format for better consistency and easier manipulation');
    recommendations.push('Implement color accessibility checks for contrast ratios');
  }
  
  if (issueTypes.has('layout')) {
    recommendations.push('Create reusable component library with standardized button, form, and card patterns');
    recommendations.push('Use consistent layout methods (prefer CSS Grid or Flexbox over float)');
    recommendations.push('Establish consistent container widths and breakpoints');
  }
  
  return recommendations;
}

/**
 * Gets detailed visual consistency data for analysis
 */
export function getVisualConsistencyData() {
  return {
    spacing: extractSpacingValues(),
    typography: extractTypographyValues(),
    colors: extractColorValues()
  };
}

/**
 * Runs a comprehensive visual consistency audit
 */
export function auditVisualConsistency(): AuditScore {
  const issues: VisualIssue[] = [];
  
  // Collect all visual consistency issues
  issues.push(...analyzeSpacing());
  issues.push(...analyzeTypography());
  issues.push(...analyzeColorPalette());
  issues.push(...analyzeLayout());
  
  // Calculate score based on issues with weighted severity
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  let score = 10;
  score -= criticalIssues * 3;  // Critical issues: -3 points each
  score -= highIssues * 2;      // High issues: -2 points each
  score -= mediumIssues * 1;    // Medium issues: -1 point each
  score -= lowIssues * 0.5;     // Low issues: -0.5 points each
  
  // Ensure score is between 1 and 10
  score = Math.max(1, Math.min(10, score));
  
  // Generate contextual recommendations
  const recommendations = generateVisualConsistencyRecommendations(issues);
  
  return {
    score: Math.round(score * 10) / 10,
    issues: issues.map(i => `${i.severity.toUpperCase()}: ${i.description}`),
    recommendations: recommendations.slice(0, 8) // Limit to top 8 recommendations
  };
}