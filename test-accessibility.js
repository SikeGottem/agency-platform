// Simple test of accessibility audit functionality
const { auditAccessibilitySync } = require('./src/lib/audit/accessibility.ts');

console.log('Testing accessibility audit...');

try {
  // Mock basic DOM environment for Node.js
  global.window = {
    getComputedStyle: () => ({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      fontSize: '16px',
      fontWeight: 'normal',
      outline: 'none',
      outlineWidth: '0px',
      boxShadow: 'none',
      border: 'none'
    })
  };

  global.document = {
    querySelectorAll: () => [],
    querySelector: () => null
  };

  const result = auditAccessibilitySync();
  
  console.log('✅ Accessibility audit completed successfully!');
  console.log(`Score: ${result.score}/10`);
  console.log(`Issues found: ${result.issues.length}`);
  console.log(`Recommendations: ${result.recommendations.length}`);
  
  if (result.issues.length > 0) {
    console.log('\nIssues:');
    result.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  console.log('\nRecommendations:');
  result.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

} catch (error) {
  console.error('❌ Error running accessibility audit:', error.message);
}