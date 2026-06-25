const fs = require('fs');
const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));

// Find and update test #3 - subscribe idempotent logic
const test3 = data.find(t => t.description.includes('idempotent re-prompt logic'));
if (test3) {
  test3.passes = true;
  console.log('✓ Updated test 3: Subscribe message idempotent logic');
}

// Find and update test #5 - knowledge search empty state
const test5 = data.find(t => t.description.includes('no knowledge search results'));
if (test5) {
  test5.passes = true;
  console.log('✓ Updated test 5: Knowledge search empty state');
}

fs.writeFileSync('feature_list.json', JSON.stringify(data, null, 2));
console.log('\n✅ feature_list.json updated');

const passing = data.filter(t => t.passes).length;
const total = data.length;
const percentage = Math.round(passing/total*100);
console.log(`\nStatus: ${passing}/${total} passing (${percentage}%)`);
console.log(`Remaining: ${total - passing} tests`);
