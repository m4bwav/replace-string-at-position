# replace-string-at-position
Simple lite string replacer when you only want to replace a substring at a particular position.

## Installation

Installation is easiest through npm:

`npm install replace-string-at-position --save`


## Usage

**replace-string-at-position** can be included as a reference.

```
var getTitleAtUrl = require('replace-string-at-position');

getTitleAtUrl(url, function(title){
  console.log(title);
});
```

## CLI

```
$ npm install --global replace-string-at-position
```

```
  Usage
    $ replace-string-at-position "<url>"

  Example
    $ replace-string-at-position "http://www.google.com"
```

## License

MIT © [Mark Rogers](http://www.markdavidrogers.com)
