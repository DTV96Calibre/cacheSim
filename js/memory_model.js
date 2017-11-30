
var globalMemory;

class MemoryWordEntry {


	constructor(bytes, address, parentMem) {
		this.bytes = bytes;
		this.address = address;
		this.parentMem = parentMem;
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

	setBytes(bytes) {
		if (bytes.length != this.bytes.length) {
			console.log("Error: Attempting to set word to " + bytes + " (wrong size)");
		}
		this.bytes = bytes;
	}
}

// This class controls main memory, and provides methods for caches to interact
// with each other.
class MemoryObj {

	// memSize is the number of words in main memory.
	constructor(wordSize, memSize) {
		this.wordSize = wordSize;
		this.memSize = memSize;
		this.memory = [];
		this.caches = [];


		// An arbitrary number, so that memory doesn't start at 0.
		this.baseAddress = Math.pow(2, 10);
		this.byteMaxValue = 256;
		this.generateWords();
	}

	generateWords() {
		this.memory = [];
		this.caches = [];
		for (var i = 0; i < this.memSize; i++) {
			var bytes = [];
			for (var j = 0; j < this.wordSize; j++) {
				var num = Srand.random() * this.byteMaxValue;
				bytes.push(Math.floor(num));
			}
			var address = this.baseAddress + i * this.wordSize;
			var word = new MemoryWordEntry(bytes, address, this);
			this.memory.push(word);
		}
	}


	getWordSize() {
		return this.wordSize;
	}
	getWordCount() {
		return this.memSize;
	}
	getByteCount() {
		return this.getWordSize() * this.getWordCount();
	}

	getWord(address) {
		var realAddress = address - this.getBaseAddress();
		if (realAddress % this.getWordSize() != 0) {
			console.log("Error: Attempt to access unaligned address " + address
				+ " with: {baseAddress = " + this.getBaseAddress() + ", wordSize = " + this.getWordSize() + "}");
		}

		var wordAddress = realAddress / this.getWordSize();
		return this.memory[wordAddress];
	}


	getCaches() {
		return this.caches;
	}
	getCache(index) {
		return this.caches[index];
	}
	getBaseAddress() {
		return this.baseAddress;
	}
	setWordSize(size) {
		this.wordSize = size;
	}
	setWordCount(size) {
		this.memSize = size;
	}

	// When the user is setting the word, set the sourceCache to null.
	// Bytes is an array of four bytes.
	writeWord(address, bytes, sourceCache) {
		// First, broadcast that the value has changed.
		for (var i = 0; i != this.getCaches().length; i++) {
			var cache = this.getCaches()[i];
			if (cache == sourceCache) {
				continue;
			}
			cache.wordModified(address);
		}

		// Then change the word.
		var word = getWord(address);
		word.setBytes(bytes);
	}

	readWord(address, sourceCache) {
		var word = getWord(address);

		// First, broadcast that the value is being read.
		for (var i = 0; i != this.getCaches().length; i++) {
			var cache = this.getCaches()[i];
			if (cache == sourceCache) {
				continue;
			}

			// byteRead returns an array of bytes if it needs to do writeback,
			// or null otherwise.
			var bytes = cache.wordRead(address);
			if (bytes) {
				var word = word.setBytes(bytes);
			}
		}

		// Then read the word and return the bytes.
		return word.getBytes();

	}

	generateCache(wordsPerLine, cacheLineCount) {
		var cache = new CacheObj(wordsPerLine, cacheLineCount, this);
		this.caches.push(cache);
		return cache;
	}
	getIndexForCache(cache) {
		for (var i = 0; i < this.caches.length; i++) {
			if (cache == this.caches[i]) {
				return i;
			}
		}
		console.log("getIndexForCache failed!");
		return undefined;
	}
}
