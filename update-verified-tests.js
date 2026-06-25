const fs = require('fs');
const tests = JSON.parse(fs.readFileSync('feature_list.json'));

// Tests to mark as passing based on screenshot evidence
const testsToPass = [
  "Verify H5 mock data adapter seeds non-empty demo data for verification",
  "Verify empty state when no weight records exist",
  "Verify app layout is responsive and mobile-optimized",
  "Verify brand color #FF8A65 (warm coral) is used for primary actions and accents",
  "Verify UI uses rounded cards with soft shadows and generous spacing",
  "Verify Chinese microcopy is friendly and clear throughout app"
];

let updated = 0;
tests.forEach(test => {
  if (testsToPass.includes(test.description) && !test.passes) {
    test.passes = true;
    updated++;
    console.log(`✓ Marked as passing: ${test.description}`);
  }
});

fs.writeFileSync('feature_list.json', JSON.stringify(tests, null, 2));
console.log(`\nUpdated ${updated} tests to passing status.`);

// Count totals
const passing = tests.filter(t => t.passes).length;
const total = tests.length;
console.log(`\nTotal: ${passing}/${total} passing (${Math.round(passing/total*100)}%)`);
