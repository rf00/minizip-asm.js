if (exports) {
	var chai = require("chai");
	var Minizip = require("../../lib/minizip-asm.min.js");
}

describe("Given an instance of Minizip", function() {
	
	var mz = new Minizip();
	
	describe("When I invoke mz.list()", function() {
		var array = mz.list();
		
		it("should return [] since no file was appended", function() {
			expect(array.length).to.be.equal(0);
		});
	});
	
	var filepath = "haha/123.txt";
	var content = "Abc Text file";
	var password = "-_-";
	
	describe("After appending a file", function() {
		mz.append(filepath, content);
		var array = mz.list();
		
		it("mz.list() should return an array contains one element", function() {
			expect(array.length).to.be.equal(1);
		});
		
		it("That elements' filepath is \"" + filepath + "\"", function() {
			expect(array[0].filepath).to.be.equal(filepath);
		});
		
		it("That element is unencrypted", function() {
			expect(array[0].crypt).to.be.equal(false);
		});
	});
	
	describe("Then extract the content", function() {
		it("Should be \"" + content + "\"", function() {
			expect(mz.extract(filepath, {encoding: "utf8"})).to.be.equal(content);
		});
	});
	
	describe("Append 10 encrypted file", function() {
		for (var i = 0; i < 10; i++) {
			mz.append(i + ".txt", content, {password: password});
		}
		
		var array = mz.list();
		
		it("mz.list() should return 11 elements", function() {
			expect(array.length).to.be.equal(11);
		});
		
		it("10 elements encrypted", function() {
			var n = 0;
			for (var i = 0; i < array.length; i++) {
				if (array[i].crypt) {
					n++;
				}
			}
			expect(n).to.be.equal(10);
		});
	});
	
	describe("Extract all elements with password", function() {
		var array = mz.list();
		
		it("All of their content should be \"" + content + "\"", function() {
			for (var i = 0; i < array.length; i++) {
				if (array[i].crypt) {
					expect(mz.extract(filepath, {encoding: "utf8", password: password})).to.be.equal(content);
				} else {
					expect(mz.extract(filepath, {encoding: "utf8"})).to.be.equal(content);
				}
			}
		});
	});
	
	describe("Retrive zip file as ArrayBuffer", function() {
		it("Have length property", function() {
			expect("length" in mz.zip()).to.be.equal(true);
		});
	});
});