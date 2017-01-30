	var buf;
	var len;
	var SIZE_T = 4;
	var ufListLen = Module._malloc(SIZE_T);
	Module.HEAPU8.set(Buffer.alloc(SIZE_T), ufListLen);
	var INT = 1;
	var reterr = Module._malloc(INT);
	Module.HEAPU8.set(Buffer.alloc(INT), reterr);
	
	if (zipfile) {
		if (!("length" in zipfile)) {
			throw new Error("No length in buffer");
		}
		len = zipfile.length;
		buf = Module._malloc(len);
		Module.HEAPU8.set(zipfile, buf);
	}
	
	this.list = function(options) {
		if (!buf) {
			return [];
		}
		if (!len) {
			throw new Error("Can't get buffer length");
		}
		
		var _options = {
			encoding: "utf8"
		};
		for (var key in options) {
			_options[key] = options[key];
		}
		options = _options;
		var encoding = options.encoding;
		
		Module.HEAPU8.fill(0, ufListLen, ufListLen + SIZE_T);
		Module.HEAPU8.fill(0, reterr, reterr + INT);
		
		var ufList = Module.ccall("list", "number", ["number", "number", "number", "number"], [buf, len, ufListLen, reterr]);
		var str = Module.Pointer_stringify(ufList);
		if (Module.HEAPU8[reterr]) {
			throw new Error(str);
		}
		Module._free(ufList);
		
		var obj = JSON.parse(str);
		var newObj = [];
		for (var key in obj) {
			var o = {
				filepath: Buffer.from(obj[key].filename_inzip, "hex"),
				crypt: obj[key].charCrypt
			};
			if (!(encoding == "utf8" || encoding == "utf-8" || encoding == "buffer")) {
				throw new Error("Unknown Encoding");
			}
			if (encoding == "utf8" || encoding == "utf-8") {
				o.filepath = o.filepath.toString()
			}
			newObj.push(o);
		}
		
		return newObj;
	}
	
	this.extract = function(filepath, options) {
		if (!buf) {
			throw new Error("Blank file");
		}
		if (!len) {
			throw new Error("Can't get buffer length");
		}
		filepath = Buffer.from(filepath);
		var _options = {
			encoding: "buffer",
			password: null
		};
		for (var key in options) {
			_options[key] = options[key];
		}
		options = _options;
		var encoding = options.encoding;
		
		Module.HEAPU8.fill(0, reterr, reterr + INT);
		var filename = Module._malloc(filepath.length);
		Module.HEAPU8.set(filepath, filename);
		var password = null;
		if (options.password) {
			var _password = Buffer.from(options.password);
			password = Module._malloc(_password.length);
			Module.HEAPU8.set(_password, password);
		}
		var fileBufSize = Module._malloc(SIZE_T);
		Module.HEAPU8.set(Buffer.alloc(SIZE_T), fileBufSize);
		
		var fileBuf = Module.ccall('extract', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [buf, len, filename, password, fileBufSize, reterr]);
		if (Module.HEAPU8[reterr]) {
			throw new Error(Module.Pointer_stringify(fileBuf));
		}
		var size = Buffer.from(Module.HEAPU8.subarray(fileBufSize, fileBufSize + SIZE_T)).readUInt32LE();
		var buffer = Buffer.from(Module.HEAPU8.subarray(fileBuf, fileBuf + size));
		
		Module._free(filename);
		if (password) {
			Module._free(password);
		}
		Module._free(fileBufSize);
		Module._free(fileBuf);
		
		if (!(encoding == "utf8" || encoding == "utf-8" || encoding == "buffer")) {
			throw new Error("Unknown Encoding");
		}
		if (encoding == "utf8" || encoding == "utf-8") {
			buffer = buffer.toString();
		}
		return buffer;
	}
	
	this.append = function(filepath, data, options) {
		var newBuf = 0;
		if (!buf && !len) {
			newBuf = 1;
		} else if (!buf || !len) {
			throw new Error("Can't get buffer length");
		}
		filepath = Buffer.from(filepath);
		data = Buffer.from(data);
		var _options = {
			password: null,
			compressLevel: 5
		};
		for (var key in options) {
			_options[key] = options[key];
		}
		options = _options;
		
		Module.HEAPU8.fill(0, reterr, reterr + INT);
		var newLen = Module._malloc(SIZE_T);
		Module.HEAPU8.set(Buffer.alloc(SIZE_T), newLen);
		var filename = Module._malloc(filepath.length);
		Module.HEAPU8.set(filepath, filename);
		var password = null;
		if (options.password) {
			var _password = Buffer.from(options.password);
			password = Module._malloc(_password.length);
			Module.HEAPU8.set(_password, password);
		}
		var fileLen = data.length;
		var fileBuf = Module._malloc(fileLen);
		Module.HEAPU8.set(data, fileBuf);
		var opt_compress_level = options.compressLevel;
		
		var zipmemBase = Module.ccall('append', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [newBuf, buf, len, newLen, filename, password, fileBuf, fileLen, opt_compress_level, reterr]);
		if (Module.HEAPU8[reterr]) {
			throw new Error(Module.Pointer_stringify(zipmemBase));
		}
		buf = zipmemBase;
		len = Buffer.from(Module.HEAPU8.subarray(newLen, newLen + SIZE_T)).readUInt32LE();
		
		Module._free(newLen);
		Module._free(filename);
		if (password) {
			Module._free(password);
		}
		Module._free(fileBuf);
	}
	
	this.zip = function() {
		return Buffer.from(Module.HEAPU8.subarray(buf, buf + len));
	}
}

module["exports"] = Minizip;