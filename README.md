# replace-string-at-position

[![npm package](https://nodei.co/npm/replace-string-at-position.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/replace-string-at-position/)

[![Build Status](https://img.shields.io/travis/m4bwav/replace-string-at-position/master.svg)](https://travis-ci.org/m4bwav/replace-string-at-position)

Simple lite string replacer when you only want to replace a substring at a particular position.

## Installation

Installation is easiest through npm:

`npm install replace-string-at-position --save`


## Usage

**replace-string-at-position** can be included as a reference.

```
var replaceStringAtPosition = require('./index.js');

var result = replaceStringAtPosition('222', '2', '3', 1);
//result => 232
```

## CLI

```
$ npm install --global replace-string-at-position
```

```
  Usage
    $ replace-string-at-position <input> <source> <new> <position>

  Example
    $ replace-string-at-position 222 2 3 1
    //=> 232
```

## License

MIT © [Mark Rogers](http://www.markdavidrogers.com)
