var zip = function(data, password, perf, cbMessage) {
	
	perf = perf ? perf : 3;
	
	cbMessage = cbMessage ? cbMessage : function() {};
	
	var filepath = 'file.zip';
	
	var Module = {
		
		ENVIRONMENT: 'WEB',
		
		data: data,
		
		password: password,
		
		perf: perf,
		
		cbMessage: cbMessage,
		
		filepath: filepath,
		
		arguments: ['-o', '-' + perf.toString()],
		
		print: function(message) {
			
			Module['cbMessage'](message);
			
		},
		
		preRun: function() {
			
			pasteFileTree(Module['data'], '/');
			
			function pasteFileTree(data, filepath) {
				
				Object.keys(data).forEach(function(key) {
					
					var _filepath = filepath + '/' + key;
					
					if (data[key].isDir) {
						
						FS.mkdir(_filepath);
						
						pasteFileTree(data[key].contents, _filepath);
						
					} else {
						
						FS.writeFile(_filepath, data[key].contents, {encoding: 'binary'});
						
						Module['arguments'].push(_filepath);
						
					}
					
				});
				
			}
			
		},
		
		postRun: function() {
			
			Module['return'] = FS.readFile(Module['filepath']);
			
		},
		
		noExitRuntime: true
		
	};
	
	if (password) {
		
		Module['arguments'].push('-p', password);
		
	}
	
	Module['arguments'].push(filepath);
	