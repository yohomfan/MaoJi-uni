const fs = require('fs');
const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));
const passing = data.filter(t => t.passes).length;
const total = data.length;
console.log(`${passing}/${total} passing (${Math.round(passing/total*100)}%)`);
const failing = data.filter(t => !t.passes).slice(0, 20);
failing.forEach(t => console.log(`  TODO: ${t.description}`));
