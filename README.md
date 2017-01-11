# minizip-asm.js

[![npm version](https://badge.fury.io/js/minizip-asm.js.svg)](https://badge.fury.io/js/minizip-asm.js)

An emscripten port of minizip demo. Minizip is a higher level wrapper of zlib providing simple api for zip file compression and encryption.

## Demo

[Demo of encrypt and decrypt existing zip file](https://rf00.github.io/minizip-asm.js/example/)

## Features

* Zip and unzip.
* Encrypt and decrypt too.

## Installation

```html
<script src="path/to/lib/minizip-asm.min.js"></script>
```

```js
npm install minizip-asm.js

var minizip = require('minizip-asm.js')
```

## Getting started

```js
var minizip = require('minizip-asm.js');

var fs = require('fs');

var buffer = fs.readFileSync('example.js');

// This is format of the folder to zip or return from unzip
var contents = {
	
	'example.js': {
		
		isDir: false,
		
		// The data could be node buffer or Uint8Array
		contents: buffer
		
	},
	
	'folderForBackup': {
		
		// If isDir is true, The contents of it contain a directory(keys) instead of file data
		isDir: true,
		
		contents: {
			
			'example_copy.js': {
				
				isDir: false,
				
				contents: buffer
				
			},
			
			'example_copy2.js': {
				
				isDir: false,
				
				contents: buffer
				
			}
			
		}
		
	}
	
};

// Optional password for creating an encrypted zip file
var file = minizip.zip(contents, 'myPassword');

fs.writeFileSync('file.zip', file);

try {
	
	var unzipData = minizip.unzip(file);
	
} catch(e) {
	
	console.log(e);
	
	var unzipData = minizip.unzip(file, 'myPassword');
	
	// Walk through the folder
	console.log(minizip.walk(unzipData));
	
}

var encryptedFile = fs.readFileSync('file.zip');

// Decrypt a zip file
fs.writeFileSync('file.zip', minizip.decrypt(encryptedFile, 'myPassword'));
```

## Usage
### `minizip.zip(data[, password, perf, cbMessage, noBuf])`

Return buffer of zip file data.

`data` - A folder like the example

`password` - optional password

`perf` - optional performance setting, from 0 - 9, 0 means store only, 1 means compress faster, 9 means compress better, default 3

`cbMessage` - optional callback, contains a message which is printf from minizip

`noBuf` - optional, return raw Uint8Array if true

### `minizip.upzip(data[, password, cbMessage, noBuf])`

Return a folder like the example. It will throw error if a valid password is required.

`data` - Buffer | Uint8Array

`password` - optional password

`cbMessage` - optional callback, contains a message which is printf from minizip

`noBuf` - optional, return raw Uint8Array if true

### `minizip.encrypt(data, password[, perf, cbMessage, noBuf])`

This is a wrapper function of unzip and zip which could convert an existing unencrypted zip file into an encrypted one. Return buffer of zip file data.

`data` - Existing unencrypted Buffer | Uint8Array

`password` - password for encryption

`perf` - optional performance setting, from 0 - 9, 0 means store only, 1 means compress faster, 9 means compress better, default 3

`cbMessage` - optional callback, contains a message which is printf from minizip

`noBuf` - optional, return raw Uint8Array if true

```js
var zipfiledata = fs.readFileSync('unencryptedFile.zip');

var data = minizip.encrypt(zipfiledata, 'myPassword');

fs.writeFileSync('encryptedFile.zip', data);
```

### `minizip.decrypt(data, password[, perf, cbMessage, noBuf])`

This is a wrapper function of unzip and zip which could convert an existing encrypted zip file into an unencrypted one. Return buffer of zip file data. It will throw error if a valid password is required.

`data` - Existing encrypted Buffer | Uint8Array

`password` - password for decryption

`perf` - optional performance setting, from 0 - 9, 0 means store only, 1 means compress faster, 9 means compress better, default 3

`cbMessage` - optional callback, contains a message which is printf from minizip

`noBuf` - optional, return raw Uint8Array if true

### `minizip.walk(data, cb)`

Walk through the folder return from unzip. Return an array contains file with its absolute path and contents.

`data` - A folder like the example

`cb` - optional callback, contains an object of isDir and contents

```js
var data = minizip.unzip(something);

minizip.walk(data);
// [{filepath: 'path/to/example.txt', contents: buffer | Uint8Array}, {filepath: 'path/to/example2.txt', contents: buffer | Uint8Array}, ...]
```

## Notice

1. It is synchronize which means minizip will block the process and ui, It will be cool to put it in a web worker or fork a child process.
2. The size of minizip-asm.js is around 1.3MB, minizip-asm.min.js is around 0.7MB.
3. Sometimes fail silently.
4. If the file is too big(>40MB), browser will fail.
5. Contents of zip contain filename which is not ASCII, not very well.
