# minizip-asm.js

[![Build Status](https://travis-ci.org/rf00/minizip-asm.js.svg?branch=master)](https://travis-ci.org/rf00/minizip-asm.js) [![npm version](https://badge.fury.io/js/minizip-asm.js.svg)](https://www.npmjs.com/package/minizip-asm.js)

Minizip in javascript. Demo: [https://rf00.github.io/minizip-asm.js/example/](https://rf00.github.io/minizip-asm.js/example/)

## Features

* Zip file
* Extract file
* Work with password

## Installation

```html
<script src="https://raw.githubusercontent.com/rf00/minizip-asm.js/master/lib/minizip-asm.min.js"></script>
```

```js
npm install minizip-asm.js

var Minizip = require('minizip-asm.js');
```

## Getting started

```js
var fs = require("fs");

var text = new Buffer("Abc~~~");
var mz = new Minizip();

mz.append("haha/abc.txt", text, {password: "~~~"});
fs.writeFileSync("abc.zip", new Buffer(mz.zip()));
```

## Usage

### new Minizip(ArrayBuffer)

*Constructor for making a new zip file or opening from existing one.*

* @`ArrayBuffer` {Buffer|Uint8Array} \<optional> - It can be either Node.js Buffer read from zip file or Uint8Array in web browser.

* @ Return an instance of Minizip.

### mz.list(options)

*List all files in Minizip with full filepath and have password or not.*

* @`options` \<optional>

  * @`encoding` {"utf8"|"buffer"} \<default="utf8"> - Since the filepath may not encode in utf8. It will be handy to have an ArrayBuffer to do detection on encoding.

* @ Return an `Array`. Something like this:
    
    ```js
    [{
      filepath: "haha/abc.txt",
      crypt: true // (type: boolean)
    }]
    ```

### mz.extract(filepath, options)

*Extract one file.*

* @`filepath` {String|Buffer|Uint8Array} - Full filepath to extract.

* @`options` \<optional>

  * @`encoding` {"utf8"|"buffer"} \<default="buffer"> - File can return in text.
  
  * @`password` {String|Buffer|Uint8Array} \<optional>

* @ Return a `Buffer`.

### mz.append(filepath, data, options)

*Append one file.*

* @`filepath` {String|Buffer|Uint8Array} - Full filepath to extract.

* @`data` {String|Buffer|Uint8Array} - File data.

* @`options` \<optional>

  * @`password` {String|Buffer|Uint8Array} \<optional>
  
  * @`compressLevel` {Number} \<default=5> - 0: Store only. 1: Compress faster. 9: Compress better.

* @ Return nothing.

### mz.zip()

*Retrive zip file.*

* @ Return a `Buffer`.

## Notice

1. It is synchronize.
2. The size of minizip-asm.min.js is around 0.6MB.
