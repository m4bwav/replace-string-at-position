var replaceStringAtPosition = require('./index.js');
var position = parseInt(process.argv[5], 10);

var result = replaceStringAtPosition(process.argv[2], process.argv[3], process.argv[4], position);

console.log(result);
