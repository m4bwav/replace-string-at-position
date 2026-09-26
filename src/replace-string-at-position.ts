// Names a rejected argument in an error message without calling anything on it (no toString, no getters).
function describe(value: unknown): string {
  switch (typeof value) {
    case 'string': {
      // Cut by code points, so a surrogate pair is never split; the cut also bounds the message's size.
      const codePoints = [...value.slice(0, 40)];
      return `the string ${JSON.stringify(codePoints.length > 20 ? `${codePoints.slice(0, 20).join('')}...` : value)}`;
    }

    case 'number': {
      return String(value);
    }

    case 'bigint': {
      // Not its digits: printing a huge BigInt is unbounded work on caller input.
      return 'a bigint';
    }

    case 'undefined': {
      return 'undefined';
    }

    case 'object': {
      if (value === null) {
        return 'null';
      }

      try {
        return Array.isArray(value) ? 'an array' : 'an object';
      } catch {
        // Array.isArray throws for a revoked Proxy.
        return 'an object';
      }
    }

    case 'boolean':
    case 'symbol':
    case 'function': {
      return `a ${typeof value}`;
    }
  }

  // Unreachable: typeof has no other results, but TypeScript does not treat the switch as exhaustive.
  return 'a value';
}

// A string primitive, or the value of a String wrapper object (1.0.4 accepted both). The brand check works across realms and
// rejects array-likes such as {length: 3}, which 1.0.4 read as three characters. It reads the object's internal value and
// runs no caller code: an overridden valueOf, Symbol.toPrimitive or substring is ignored, and a Proxy is refused (1.0.4 called them).
function toText(value: unknown, name: string): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    try {
      return String.prototype.valueOf.call(value);
    } catch {
      // Not a String object; reported below.
    }
  }

  throw new TypeError(`Expected \`${name}\` to be a string, got ${describe(value)}`);
}

// 1.0.4 coerced anything into a position (a missing one duplicated the text, '1' was joined as text); v2 takes an integer
// from 0 to the text's length and refuses the rest (plan D3).
function assertPosition(position: unknown, length: number): asserts position is number {
  if (typeof position !== 'number') {
    throw new TypeError(`Expected \`position\` to be a number, got ${describe(position)}`);
  }

  if (!Number.isSafeInteger(position) || position < 0 || position > length) {
    throw new RangeError(`Expected \`position\` to be an integer from 0 to ${length}, got ${describe(position)}`);
  }
}

/**
Replaces the part of `originalString` that starts at `position` and is as long as `sourceString` with `newString`.

The text at the position is not compared with `sourceString`; only its length counts, and a `sourceString` that runs past the end removes the rest of the text. Positions and lengths count UTF-16 code units, as `String.prototype.slice` and the indexes from `RegExp.prototype.exec` do.

@param originalString - The text to change.
@param sourceString - The text being replaced; only its length is used.
@param newString - The text to put in its place.
@param position - Where the replaced text starts: an integer from 0 to `originalString.length`.
@returns The changed text.
@throws {TypeError} When a text argument is not a string (or a `String` object), or `position` is not a number.
@throws {RangeError} When `position` is not an integer from 0 to `originalString.length`.

@example
```
replaceStringAtPosition('hello world', 'world', 'there', 6);
//=> 'hello there'
```
*/
export function replaceStringAtPosition(originalString: string, sourceString: string, newString: string, position: number): string {
  const text = toText(originalString, 'originalString');
  const source = toText(sourceString, 'sourceString');
  const replacement = toText(newString, 'newString');
  assertPosition(position, text.length);
  return text.slice(0, position) + replacement + text.slice(position + source.length);
}
