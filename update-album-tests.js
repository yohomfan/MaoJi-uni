const fs = require('fs');

const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));

const updated = data.map(test => {
  if (test.description === 'Upload daily photos to pet album and verify grid view') {
    return { ...test, passes: true };
  }
  if (test.description === 'Preview album photo and delete photo') {
    return { ...test, passes: true };
  }
  return test;
});

fs.writeFileSync('feature_list.json', JSON.stringify(updated, null, 2));

const passing = updated.filter(t => t.passes).length;
console.log(`Updated album tests: ${passing}/${updated.length} passing (${Math.round(passing/updated.length*100)}%)`);
