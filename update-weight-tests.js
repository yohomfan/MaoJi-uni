const fs = require('fs');

const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));

const updated = data.map(test => {
  if (test.description === 'View weight chart visualization (line chart over time)') {
    return { ...test, passes: true };
  }
  if (test.description === 'Verify weight chart shows healthy band overlay based on breed standards') {
    return { ...test, passes: true };
  }
  return test;
});

fs.writeFileSync('feature_list.json', JSON.stringify(updated, null, 2));

const passing = updated.filter(t => t.passes).length;
console.log(`Updated weight chart tests: ${passing}/${updated.length} passing (${Math.round(passing/updated.length*100)}%)`);
