# replace-string-at-position

[![Join the chat at https://gitter.im/m4bwav/replace-string-at-position](https://badges.gitter.im/m4bwav/replace-string-at-position.svg)](https://gitter.im/m4bwav/replace-string-at-position?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm package](https://nodei.co/npm/replace-string-at-position.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/replace-string-at-position/)

[![Build Status](https://img.shields.io/travis/m4bwav/replace-string-at-position/master.svg)](https://travis-ci.org/m4bwav/replace-string-at-position)
[![Dependency Status](https://img.shields.io/david/m4bwav/replace-string-at-position.svg)](https://david-dm.org/m4bwav/replace-string-at-position)
[![Coverage Status](https://img.shields.io/coveralls/m4bwav/replace-string-at-position/master.svg)](https://coveralls.io/github/m4bwav/replace-string-at-position?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/npm/replace-string-at-position/badge.svg?style=flat-square)](https://snyk.io/test/npm/replace-string-at-position)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Gitter](https://badges.gitter.im/m4bwav/replace-string-at-position.svg)](https://gitter.im/m4bwav/replace-string-at-position?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

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
