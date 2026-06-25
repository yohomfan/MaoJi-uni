const fs = require('fs');
const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));
const failing = data.filter(t => !t.passes);
console.log(JSON.stringify(failing, null, 2));
