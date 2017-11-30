
// Seed for generating random values for the cache using the jsrand library
var SEED = 10;

// The MSI state enum.
var MsiState = {
	Modified: 1,
	Shared: 2,
	Invalid: 3
}

class CacheWordEntry {

	// address is the 32bit pointer to where it originally
	// came from in memory.
	// Note: Words initialize as Invalid.
	constructor(parentCache) {
		this.address = 0;
		this.parentCache = parentCache;
		this.word = null;
		this.hasAddress = false;

		// MSI state is kept on a per-word basis.
		this.state = MsiState.Invalid;
	}

	getWord() {
		if (this.state == MsiState.Invalid) {
			this.setShared();
		} 
		return this.word;
	}
	getBytes() {
		if (this.state == MsiState.Invalid) {
			this.getWord();
		}
		return this.word.getBytes();
	}
	getByte(byteOffset) {
		if (this.state == MsiState.Invalid) {
			this.getWord();
		}
		return this.word.bytes[byteOffset];
	}
	getSize() {
		return this.parentCache.getWordSize();
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
	getState() {
		return this.state;
	}
	getHasAddress() {
		return this.hasAddress;
	}

	// These are methods to control the MSI state, assuming this
	// word is still pointing at the same address. If assigning
	// a new address, use changeWord() instead.
	setInvalid() {
		this.state = MsiState.Invalid;
	}
	setShared() {
		if (this.hasAddress) {
			// Read the word.
			var mem = this.parentCache.getMemory();
			this.state = MsiState.Shared;
			mem.bcastRead(address, this);
			this.word = this.parentCache.getMemory().getWord(this.address);
		} else {
			console.log("Error: Attempt to get word with no address");
		}
	}
	setModified(newBytes) {
		if (this.state == MsiState.Invalid) {
			console.log("Error: Attempting to modify Invalid word! Use changeWord() instead.");
		}
		this.state = MsiState.Modified;
		this.bytes = newBytes;
	}

	setAddress(address) {
		this.address = address;
		this.hasAddress = true;
	}
	clearAddress() {
		this.address = 0;
		this.hasAddress = false;
	}

}

// Constructs a cache object.
class CacheObj {

	constructor(wordsPerLine, cacheLineCount, parentMemory) {
		// Each entry in cacheLines is an array of WordEntries.
		// WordEntry has an array of bytes and an address.
		this.cacheLines = [];
		
		if (parentMemory === undefined) {
			throw "Error: parentMemory parameter not given!";
		}
		this.parentMemory = parentMemory;
		
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
				var word = new CacheWordEntry(this);
				line.push(word);
			}
			this.cacheLines.push(line);
		}
	}

	// Get stats about how the cache is currently set up.
	getLineCount() {
		return this.cacheLines.length;
	}
	getMemory() {
		return this.parentMemory;
	}
	getWordSize() {
		var mem = this.getMemory();
		return mem.getWordSize();
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
				if (word.getHasAddress()) {
					bytes.push(word.getByte(j));
				} else {
					bytes.push(0);
				}
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
		if (word.getHasAddress()) {
			return word.getByte(byteOffset);
		} else {
			return 0;
		}
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
