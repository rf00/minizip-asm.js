var unzip = function(data, password, cbMessage) {
	
	cbMessage = cbMessage ? cbMessage : function() {};
	
	var filepath = 'file.zip';
	
	var output = '/output';
	
	var Module = {
		
		ENVIRONMENT: 'WEB',
		
		data: data,
		
		password: password,
		
		cbMessage: cbMessage,
		
		requireValidPassword: false,
		
		filepath: filepath,
		
		output: output,
		
		arguments: [filepath, '-d', output],
		
		print: function(message) {
			
			if (message == 'error -3 with zipfile in unzReadCurrentFile') {
				
				Module['requireValidPassword'] = true;
				
			}
			
			Module['cbMessage'](message);
			
		},
		
		preRun: function() {
			
			FS.writeFile(Module['filepath'], Module['data'], {encoding: 'binary'});
			
			FS.mkdir(Module['output']);
			
		},
		
		postRun: function() {
			
			if (Module['requireValidPassword']) {
				
				Module['return'] = null;
				
				return;
				
			}
			
			var fileTree = FS.lookupPath(Module['output']).node;
			
			var folder = walkFileTree(fileTree);
			
			function walkFileTree(fileTree) {
				
				var folder = {};
				
				var contents = fileTree.contents;
				
				Object.keys(contents).forEach(function(key) {
					
					var mode = contents[key].mode;
					
					if (FS.isDir(mode)) {
						
						folder[key] = {
							
							isDir: true,
							
							contents: walkFileTree(contents[key])
							
						}
						
					} else {
						
						folder[key] = {
							
							isDir: false,
							
							contents: contents[key].contents
							
						}
						
					}
					
				});
				
				return folder;
				
			}
			
			Module['return'] = folder;
			
		},
		
		noExitRuntime: true
		
	};
	
	if (password) {
		
		Module['arguments'].push('-p', password);
		
	}
	