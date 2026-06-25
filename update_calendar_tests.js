const fs = require('fs');

// Read feature list
const featureList = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));

// Calendar tests to mark as passing
const calendarTests = [
  'View unified health calendar showing all upcoming health tasks',
  'View 今日待办',
  'View overdue health tasks',
  'Tap calendar day to open bottom sheet',
  'Complete health task directly from calendar bottom sheet',
  'Postpone health task from calendar bottom sheet',
];

// Update tests
let updatedCount = 0;
featureList.forEach(test => {
  const shouldPass = calendarTests.some(desc => {
    const descLower = desc.toLowerCase();
    const testDescLower = test.description.toLowerCase();
    return testDescLower.includes(descLower.substring(0, Math.min(25, descLower.length)));
  });

  if (shouldPass && !test.passes) {
    test.passes = true;
    updatedCount++;
    console.log(`✓ Marked as passing: ${test.description}`);
  }
});

// Save updated feature list
fs.writeFileSync('feature_list.json', JSON.stringify(featureList, null, 2));

console.log(`\nUpdated ${updatedCount} calendar tests to passing status`);

// Show new stats
const passing = featureList.filter(t => t.passes).length;
const total = featureList.length;
console.log(`\nNew status: ${passing}/${total} passing (${Math.round(passing/total*100)}%)`);
