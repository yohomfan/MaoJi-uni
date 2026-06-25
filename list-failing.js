const fs = require('fs');
const tests = JSON.parse(fs.readFileSync('feature_list.json'));
const failing = tests.filter(t => !t.passes);
console.log(`\n${failing.length} failing tests:\n`);
failing.forEach((t, i) => {
  console.log(`${i+1}. [${t.category}] ${t.description}`);
});
