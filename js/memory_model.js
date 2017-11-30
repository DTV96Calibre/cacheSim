
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
}

// This class controls main memory, and provides methods for caches to interact
// with each other.
class MemoryObj {
	
	// memSize is the number of words in main memory.
	constructor(wordSize, memSize) {
		this.wordSize = wordSize;
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
		var realAddress = address - this.baseAddress;
		if (realAddress % this.getWordSize() != 0) {
			console.log("Error: Attempt to access unaligned address " + address
				+ " with: {baseAddress = " + this.baseAddress + ", wordSize = " + this.getWordSize() + "}");
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

	setWordSize(size) {
		this.wordSize = size;
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




