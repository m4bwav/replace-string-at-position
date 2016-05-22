import test from 'ava';
import replaceStringAtPosition from '.';

test('Text replacement', function (t) {
  var result = replaceStringAtPosition('222', '2', '3', 1);
  t.is(result, '232');
});
