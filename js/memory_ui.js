
var globalMemory;

function wordToId(word) {
	return "word-" + word.getAddress();
}

function idToWordAddress(idStr) {
	// This returns [junk, address] as a string array.
	var matches = idStr.match("word-(\\d+)");
	if (matches.length != 2) {
		console.log("Error in idToWord: Not a valid word string: '" + idStr + "'");
	}

	var address = parseInt(matches[1]);
	return address;
}


// Width is the number of words to display per line.
function convertMemoryToHTML(memory, width) {

	// First, make the column headers. The first column is the address, and the
	// rest are named for each word in the table.
	var wordHeader = "<tr><th></th>";
	for (var i = 0; i < width; i++) {
		var entry = "<th colspan='4'> Word " + i + " </th>";
		wordHeader += entry;
	}
	wordHeader += "</tr>"

	// Next, make the address column header and the headers for each byte.
	var byteHeader = "<tr><th>Address</th>";
	var entry = "";
	for (var i = 0; i < memory.getWordSize(); i++) {
		entry += "<th>" + i + "</th>";
	}
	for (var i = 0; i < width; i++) {
		byteHeader += entry;
	}
	byteHeader += "</tr>"

	// Put together the header sections.
	var header = "<thead>" + wordHeader + byteHeader + "</thead>";

	// Make each row.
	var rows = "";
	for (var i = 0; i < memory.getWordCount(); i++) {
		var wordEntry = "";
		var address = memory.getBaseAddress() + i * memory.getWordSize();
		var word = memory.getWord(address);
		if (i % width == 0) {
			wordEntry += "<tr><th>0x" + intToHex(address, memory.getWordSize() * 2) + "</th>";
		}
		for (var j = 0; j < memory.getWordSize(); j++) {
			var id = wordToId(word);
			wordEntry += "<th id=" + id + ">" + intToHex(word.getBytes()[j], 2) + "</th>";
		}
		if (i % width == memory.getWordSize() - 1) {
			wordEntry += "</tr>";
		}
		rows += wordEntry;
	}
	var body = "<tbody>" + rows + "</tbody>";

	// Put together the whole table.
	var table = header + body;

	return table;
}

function getMemorySize() {
	// var memorySizeSelector = document.getElementById("memory-size-options");
	// var memorySize = memorySizeSelector.options[memorySizeSelector.selectedIndex].value;
	// return parseInt(memorySize);
	return 1024;
}

// TODO: change updateCacheParameters to refresh the main memory instead of the caches.

// Writes an array of bytes to memory at specified address.
// Assumes operation has no source cache
// Convenience function
//
function writeWordToMem(){
	var wordGroup = $("#wordGroup")[0].getElementsByTagName("input");
	var word = wordGroup.length*[0];
	for (i=0;i<word.length;i++){
		var id = parseInt(wordGroup[i].id.match("byte(\\d+)")[1]);
		word[id] = hexToNum(wordGroup[i].innerHTML);
	}
	var address = hexToNum($("#addressField")[0].value);
	globalMemory.writeWord(address, word, null);
}

function readWordFromMem(){
	var address = hexToNum($("#addressField")[0].value);
	console.log(address);
	return globalMemory.readWord(address, null);
}
