var Buffer = require('buffer/').Buffer;

var zip = require('../lib/minizip.js');

var unzip = require('../lib/miniunz.js');

module.exports = {
	
	zip: function(data, password, perf, cbMessage, noBuf) {
		
		var _data = zip(data, password, perf, cbMessage);
		
		if (!noBuf) {
			
			_data = Buffer.from(_data);
			
		}
		
		return _data;
		
	},
	
	unzip: function(data, password, cbMessage, noBuf) {
		
		var _data = unzip(data, password, cbMessage);
		
		if (!_data) {
			
			throw new Error('Require valid password!');
			
		}
		
		if (!noBuf) {
			
			this.walk(_data, function(o) {
				
				o.contents = Buffer.from(o.contents);
				
			});
			
		}
		
		return _data;
		
	},
	
	encrypt: function(data, password, perf, cbMessage, noBuf) {
		
		var _data = this.unzip(data, null, cbMessage, true);
		
		_data = this.zip(_data, password, perf, cbMessage, noBuf);
		
		return _data;
		
	},
	
	decrypt: function(data, password, perf, cbMessage, noBuf) {
		
		var _data = this.unzip(data, password, cbMessage, true);
		
		_data = this.zip(_data, null, perf, cbMessage, noBuf);
		
		return _data;
		
	},
	
	walk: function(data, cb) {
		
		cb = cb ? cb : function() {};
		
		var files = [];
		
		function _walk(data, filepath) {
			
			Object.keys(data).forEach(function(key) {
				
				var _filepath = (filepath ? filepath + '/' : '') + key;
				
				if (data[key].isDir) {
					
					_walk(data[key].contents, _filepath);
					
				} else {
					
					cb(data[key]);
					
					files.push({
						
						filepath: _filepath,
						
						contents: data[key].contents
						
					});
					
				}
				
			});
			
		}
		
		_walk(data);
		
		return files;
		
	}
	
};