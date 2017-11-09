
cache = new CacheObj();

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
    
		for (var i = 0; i < cacheLineCount; i++) {
			// Make the cache line.
			var line = [];
			for (var j = 0; j < wordsPerLine; j++) {
				var word = [];
				for (var k = 0; k < wordSize; k++) {
					var num = Math.random() * byteMaxvalue;
					word.push(Math.floor(num));
				}
				line.push(word);
			}
			cacheLines.push(line);
		}
	}

	// Get stats about how the cache is currently set up.
	getLineCount() {
		return cacheLines.length();
	}
	getWordSize() {
		return wordSize;
	}
	getWordsPerLine() {
		return wordsPerLine;
	}
	getBlockCount() {
		return getWordSize() * getWordsperLine();
	}
	getByteCount() {
		return getBlockCount() * getLineCount();
	}

	// Get a particular line.
	getLine(lineNum) {
		if (lineNum >= getLineCount()) {
			console.log("Out of bounds access in getLine! this: " + this + " line: " + lineNum);
			return null;
		}
		return cacheLines[lineNum];
	}

	// Get a particular line as a series of bytes, instead of as an object.
	getBytes(lineNum) {
		if (lineNum >= getLineCount()) {
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
		if (wordIndex >= getWordsPerLine()) {
			console.log("Out of bounds access in getWord! this: " + this + " line: "
					+ lineNum + " word: " + wordIndex);
			return null;
		}
		var line = getLine(lineNum);
		return line[wordIndex];
	}

	// Get a particular byte in a line.
	getByte(lineNum, wordIndex, byteIndex) {
		if (byteIndex >= getWordSize()) {
			console.log("Out of bounds access in getByte! this: " + this + " line: "
					+ lineNum + " word: " + wordInde + " byte: " + byteIndex);
			return null;
		}
		var word = getWord(lineNum, wordIndex);
		return word[byteIndex];
	}
	
	
}


