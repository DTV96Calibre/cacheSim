

function intToHex(num) {
	return num.toString(16);
}

function intToBinary(num) {
	return num.toString(2);
}

function hexToNum(hexStr) {
	return parseInt(hexStr, 16);
}

function binToNum(binStr) {
	return parseInt(binStr, 2);
}

// Convenient list of powers of two, up to 2^max.
function powers(max) {
	var ret = [];
	var value = 2;
	for (var i = 0; i < max; i++) {
		ret.push(value);
		value *= 2;
	}

	return ret;
}

// Constructs a cache object.
class CacheObj {
	
	constructor() {
		// Each entry in cacheLines is an array of words,
		// which are arrays of bytes.
		this.cacheLines = [];
    
		this.wordSize = 4;
		this.wordsPerLine = 4;
		this.cacheLineCount = 64;

		var byteMaxValue = 256;
    
		for (var i = 0; i < this.cacheLineCount; i++) {
			// Make the cache line.
			var line = [];
			for (var j = 0; j < this.wordsPerLine; j++) {
				var word = [];
				for (var k = 0; k < this.wordSize; k++) {
					var num = Math.random() * byteMaxValue;
					word.push(Math.floor(num));
				}
				line.push(word);
			}
			this.cacheLines.push(line);
		}
	}

	// Get stats about how the cache is currently set up.
	getLineCount() {
		return this.cacheLines.length;
	}
	getWordSize() {
		return this.wordSize;
	}
	getWordsPerLine() {
		return this.wordsPerLine;
	}
	getBytesPerLine() {
		return this.getWordSize() * this.getWordsPerLine();
	}
	getByteCount() {
		return this.getBlockCount() * this.getLineCount();
	}
	getBlockCount() {
		return this.getBytesPerLine();
	}

	// Get a particular line.
	getLine(lineNum) {
		if (lineNum >= this.getLineCount()) {
			console.log("Out of bounds access in getLine! this: " + this + " line: " + lineNum);
			return null;
		}
		return this.cacheLines[lineNum];
	}

	// Get a particular line as a series of bytes, instead of as an object.
	getBytes(lineNum) {
		if (lineNum >= this.getLineCount()) {
			console.log("out of bounds access in getBytesInLine! this: " + this + " line: " + lineNum);
			return null;
		}
		var bytes = [];
		var line = getLine(lineNum);
		for (var i = 0; i < line.length(); i++) {
			var word = line[i];
			for (var j = 0; j < word.length(); j++) {
				bytes.push(word[j]);
			}
		}

		return bytes;
	}

	// Get a particular word in a line.
	getWord(lineNum, wordIndex) {
		if (wordIndex >= this.getWordsPerLine()) {
			console.log("Out of bounds access in getWord! this: " + this + " line: "
					+ lineNum + " word: " + wordIndex);
			return null;
		}
		var line = this.getLine(lineNum);
		return line[wordIndex];
	}

	// Get a particular byte in a line, indexed by word.
	getByteByWord(lineNum, wordIndex, byteOffset) {
		if (byteOffset >= this.getWordSize()) {
			console.log("Out of bounds access in getByte! this: " + this + " line: "
					+ lineNum + " word: " + wordInde + " byte: " + byteOffset);
			return null;
		}
		var word = this.getWord(lineNum, wordIndex);
		return word[byteOffset];
	}

	// Get a particular byte in a line, indexed by byte.
	getByte(lineNum, byteIndex) {
		if (byteIndex >= this.getBytesPerLine()) {
			console.log("Out of bounds access in getByte! this: " + this + " line: "
					+ lineNum + " byte: " + byteIndex);
		}
		var wordIndex = Math.floor(byteIndex / this.getWordsPerLine());
		var byteOffset = byteIndex % this.getWordsPerLine();
		return getByteByWord(lineNum, wordIndex, byteOffset);
	}
}


// Takes in a cache object, and turns it into an HTML table.
function convertCacheToHTML(cache) {

	// First, make the column headers. They're named for each word in the table.
	// These headers span 4 columns.
	var wordHeader = "<tr><th></th>";
	for (var i = 0; i < cache.getWordsPerLine(); i++) {
		var entry = "<th colspan='4'> Word " + i + " </th>";
		wordHeader += entry;
	}

	// Next, make each byte colum header. They're named for their byte index.
	var byteHeader = "<tr><th></th>";
	for (var i = 0; i < cache.getBytesPerLine(); i++) {
		var entry = "<th>" + i + "</th>";
		byteHeader += entry;
	}
	
	// Put together the header sections.
	var header = "<thead>" + wordHeader + byteHeader + "</thead>";
	
	// Make each row.
	var rows = "";
	for (var lineNum = 0; lineNum < cache.getLineCount(); lineNum++) {
		var row = "<tr><th>" + lineNum + "</th>";
		// TODO: Style the CSS for each word differently.
		for (var wordIndex = 0; wordIndex < cache.getWordsPerLine(); wordIndex++) {
			var word = "";
			for (var byteOffset = 0; byteOffset < cache.getWordSize(); byteOffset++) {
				var value = cache.getByteByWord(lineNum, wordIndex, byteOffset);
				word += "<td>" + intToHex(value) + "</td>";
			}
			row += word;
		}
		rows += row;
	}
	var body = "<tbody>" + rows + "</tbody>";

	// Put together the whole table.
	table = header + body;

	return table;
}

var cache = new CacheObj();

$('document').ready(
	function() {
		// Load the global cache into the grid UI
		var html = convertCacheToHTML(cache);
		console.log(cache);
		$('#cache-grid')[0].innerHTML = html;
	});

