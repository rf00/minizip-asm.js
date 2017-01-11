var minizip = require('../src/index.js');

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