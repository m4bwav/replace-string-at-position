var replaceStringAtPosition = require('./index.js');

var result = replaceStringAtPosition(process.argv[0], process.argv[1], process.argv[2], process.argv[3]);

console.log(result);
