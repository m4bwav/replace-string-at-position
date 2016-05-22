'use strict';

function replaceStringAtPosition(originalString, sourceString, newString, position) {
  var linkLength = sourceString.length;
  var prefix = originalString.substring(0, position);
  var afterStartPosition = position + linkLength;
  var postfix = originalString.substring(afterStartPosition, originalString.length);
  var result = prefix + newString + postfix;

  return result;
}

module.exports = replaceStringAtPosition;
