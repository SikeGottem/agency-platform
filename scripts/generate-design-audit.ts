#!/usr/bin/env node
/**
 * Script to generate the comprehensive design audit report
 */

import fs from 'fs';
import path from 'path';
import { runComprehensiveAudit, generateComprehensiveAuditReport } from '../src/lib/audit/index.js';

async function generateDesignAudit() {
  console.log('🔍 Running comprehensive design audit...');
  
  try {
    // Run the comprehensive audit
    const audit = await runComprehensiveAudit();
    
    console.log(`📊 Audit complete. Found ${audit.allIssues.length} total issues across all categories.`);
    console.log(`🚨 Top ${audit.topIssues.length} highest-priority issues identified.`);
    
    // Generate the comprehensive report
    const report = generateComprehensiveAuditReport(audit);
    
    // Write to DESIGN_AUDIT.md in project root
    const reportPath = path.join(process.cwd(), 'DESIGN_AUDIT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log(`✅ Comprehensive design audit report generated: ${reportPath}`);
    
    // Print summary
    console.log('\n📋 Summary:');
    console.log(`Overall Score: ${audit.overallScore}/10`);
    console.log(`Total Issues: ${audit.allIssues.length}`);
    console.log(`Critical: ${audit.issuesBySeverity.critical?.length || 0}`);
    console.log(`High: ${audit.issuesBySeverity.high?.length || 0}`);
    console.log(`Medium: ${audit.issuesBySeverity.medium?.length || 0}`);
    console.log(`Low: ${audit.issuesBySeverity.low?.length || 0}`);
    
    console.log('\n🎯 Top 5 Priority Issues:');
    audit.topIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
    });
    
    return audit;
  } catch (error) {
    console.error('❌ Error generating design audit:', error);
    throw error;
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDesignAudit().catch(error => {
    console.error('Failed to generate design audit:', error);
    process.exit(1);
  });
}

export { generateDesignAudit };