
// Seed for generating random values for the cache using the jsrand library
var SEED = 10;

class WordEntry {

	// address is the 32bit pointer to where it originally
	// came from in memory.
	constructor(bytes, address, parentCache) {
		this.bytes = bytes;
		this.address = address;
		this.parentCache = parentCache;
	}

	getBytes() {
		return this.bytes;
	}
	getByte(byteOffset) {
		return this.bytes[byteOffset];
	}
	getSize() {
		return this.bytes.length();
	}
	getAddress() {
		return this.address;
	}
	getTag() {
		var tagSize = this.parentCache.getTagSize();
		var indexSize = this.parentCache.getIndexSize();
		var offsetSize = this.parentCache.getByteOffsetSize();
		var tagMask = getMask(tagSize);
		var tagOffset = indexSize + offsetSize;
		return (this.address >> tagOffset) & tagMask;
	}
	getIndex() {
		var indexSize = this.parentCache.getIndexSize();
		var offsetSize = this.parentCache.getByteOffsetSize();
		var indexMask = getMask(indexSize);
		return (this.address >> offsetSize) & indexMask;
	}
}

// Constructs a cache object.
class CacheObj {

	constructor(wordSize, wordsPerLine, cacheLineCount) {
		// Each entry in cacheLines is an array of WordEntries.
		// WordEntry has an array of bytes and an address.
		this.cacheLines = [];

		this.wordSize = wordSize;
		this.wordsPerLine = wordsPerLine;
		this.cacheLineCount = cacheLineCount;

		this.byteMaxValue = 256;
		this.addressMaxValue = Math.pow(2, 24);
		this.generateCacheLines();
	}

	generateCacheLines() {
		this.cacheLines = [];
		for (var i = 0; i < this.cacheLineCount; i++) {
			// Make the cache line.
			var line = [];
			for (var j = 0; j < this.wordsPerLine; j++) {
				var bytes = [];
				for (var k = 0; k < this.wordSize; k++) {
					var num = Srand.random() * this.byteMaxValue;
					bytes.push(Math.floor(num));
				}
				var address = Math.floor(Srand.random() * this.addressMaxValue);
				var word = new WordEntry(bytes, address, this);
				line.push(word);
			}
			this.cacheLines.push(line);
		}
		console.log(this.cacheLines.length);
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

	// Setter functions
	setLineCount(n) {
		this.cacheLineCount = n;
	}
	setWordSize(n) {
		this.wordSize = n;
	}
	setWordsPerLine(n) {
		this.wordsPerLine = n;
	}

	// Get stats about how to split up the cache address.
	// The values these functions return are cached.
	getByteOffsetSize_raw() {
		var size = this.getWordSize();
		var bits = Math.floor(Math.log(size)) + 1;
		if ((1 << bits) != size) {
			console.log("Error: getWordSize() didn't return a power of two: " + size + ", bits: " + bits);
		}
		return bits;
	}
	getByteOffsetSize() {
		if (this._getByteOffsetSize === undefined) {
			this._getByteOffsetSize = this.getByteOffsetSize_raw();
		}
		return this._getByteOffsetSize;
	}
	getIndexSize_raw() {
		var size = this.getWordsPerLine();
		var bits = Math.floor(Math.log(size)) + 1;
		if ((1 << bits) != size) {
			console.log("Error: getWordsPerLine didn't return a power of two: " + size);
		}
		return bits;
	}
	getIndexSize() {
		if (this._getIndexSize === undefined) {
			this._getIndexSize = this.getIndexSize_raw();
		}
		return this._getIndexSize;
	}
	getAddressSize() {
		var bitsPerByte = 8;
		return this.getWordSize() * bitsPerByte;
	}
	getTagSize() {
		var size = this.getAddressSize();
		return size - this.getIndexSize() - this.getByteOffsetSize();
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
			console.log("Out of bounds access in getBytesInLine! this: " + this + " line: " + lineNum);
			return null;
		}
		var bytes = [];
		var line = getLine(lineNum);
		for (var i = 0; i < line.length(); i++) {
			var word = line[i];
			for (var j = 0; j < word.getSize(); j++) {
				bytes.push(word.getByte(j));
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
		return word.getByte(byteOffset);
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
