/*
  cache.js
  https://github.com/DTV96Calibre/cacheSim
*/
// Set up the initial cache.
var globalCacheCPU1;
var globalCacheCPU2;
var originalInstructionTabTitle;
var originalInstructionTabText;

// These two functions are used to encode a byte into a unique ID, and back again.
function byteToId(lineNum, wordIndex, byteOffset) {
	var id = lineNum + "-" + wordIndex + "-" + byteOffset;
	return id;
}

function idToByte(idStr) {
	// This returns [junk, lineNum, wordIndex, byteOffset] as a string array.
	var matches = idStr.match("(\\d+)-(\\d+)-(\\d+)");
	if (matches.length != 4) {
		console.log("Error in idToByte: Not a valid byte id string: '" + idStr + "'");
	}
	var lineNum = parseInt(matches[1]);
	var wordIndex = parseInt(matches[2]);
	var byteOffset = parseInt(matches[3]);
	return {
		lineNum: lineNum,
		wordIndex: wordIndex,
		byteOffset: byteOffset
	};
}

/* Takes in a cache object, and turns it into an HTML table.
 * @param cache: The CacheObj.
 * @param cpu: An int (1 or 2) describing the CPU this cache belongs to.
 */
function convertCacheToHTML(cache, cpu) {

	console.log(cache);
	console.trace();

	// First, make the column headers. They're named for each word in the table.
	// These headers span 4 columns.
	var wordHeader = "<tr><th></th>";
	for (var j = 0; j < cache.getWordSize() / 4; j++) {
		for (var i = 0; i < cache.getWordsPerLine(); i++) {
			var entry = "<th colspan='4'> Word " + i + " </th>";
			wordHeader += entry;
		}
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
		for (var wordIndex = 0; wordIndex < cache.getWordsPerLine(); wordIndex++) {
			var word = "";
			for (var byteOffset = 0; byteOffset < cache.getWordSize(); byteOffset++) {
				var value = cache.getByteByWord(lineNum, wordIndex, byteOffset);
				var valueStr = intToHex(value, 2);
				var id = byteToId(lineNum, wordIndex, byteOffset) + 'cpu' + cpu;
				var addressDisplay = intToHex(cache.getWord(lineNum, wordIndex).getAddress(), 8);
				var mouseover = "onmousedown='gridMouseClick(this)'";
				word += "<td id='" + id + "' " + mouseover + ">" + valueStr + "</td>";
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

/* Colors the text of a cache table generated from a given CacheObj.
 * @param cache: The CacheObj.
 * @param cpu: An int (1 or 2) describing the CPU this cache belongs to.
 */
function setTableEntryColors(cache, cpu) {
	// Local caches have distinguishable color palettes for readability
	var colors;
	if (cpu == 1) {
		//colors = ['#e6ecff', '#ccd9ff', '#b3c6ff', '#99b3ff'];
		//colors = ['#BFDBF7', '#AFA2F2', '#7AC4D3', '#B5FFE1'];
		colors = ['#D9DBD2', '#ADCCC0', '#B6EFBC','#E4F2E1'];
	} else {
		//colors = ['#e6ffe6', '#ccffcc', '#b3ffb3', '#99ff99'];
		colors = ['#E4F2E1', '#B6EFBC', '#ADCCC0', '#D9DBD2'];
	}

    // Record the cache parameters before beginning iteration
    var numLines = cache.cacheLineCount;
    var numWords = cache.wordsPerLine;
    var numBytes = cache.wordSize;

    // Set the font color of each interior cell of the table
    for (var line = 0; line < numLines; line++) {
        for (var word = 0; word < numWords; word++) {
            for (var byte = 0; byte < numBytes; byte++) {
                var id = "#" + byteToId(line, word, byte) + 'cpu' + cpu;
                $(id).css("background-color", colors[word % colors.length]);
            }
        }
    }
}

// TODO: Make these ui-reading functions have a common naming theme.
//       Maybe add "Option" to the end of each? Apply the same theme
//       to the similar functions in js/memory_ui.js

// Reads the user-selected word size from the corresponding dropdown.
function getWordSize() {
	var wordSizeSelector = document.getElementById("word-size-options");
	var wordSize = wordSizeSelector.options[wordSizeSelector.selectedIndex].value;
	return parseInt(wordSize);
}

// TODO: Move this to js/memory_ui.js
// Reads the user-selected block size from the corresponding dropdown.
function getBlockSize() {
	var blockSizeSelector = document.getElementById("block-size-options");
	var blockSize = blockSizeSelector.options[blockSizeSelector.selectedIndex].value;
	return parseInt(blockSize);
}

// Reads the user-selected number of cache lines from the corresponding dropdown.
function getCacheLineCount() {
	var cacheLinesSelector = document.getElementById("index-size-options");
	var cacheLines = cacheLinesSelector.options[cacheLinesSelector.selectedIndex].value;
	return parseInt(cacheLines);
}

// TODO: Rename.
/*
 * Updates all caches.
 */
function updateCaches() {
	globalMemory.setWordSize(getWordSize());
	globalMemory.setWordCount(getMemorySize());
	globalMemory.generateWords();

	var blockSize = getBlockSize();
	var lineCount = getCacheLineCount();
	globalCacheCPU1 = globalMemory.generateCache(blockSize, lineCount, globalMemory);
	globalCacheCPU2 = globalMemory.generateCache(blockSize, lineCount, globalMemory);

	// Purely asthetic.
	var globalMemoryWidth = 4;

	var html1 = convertCacheToHTML(globalCacheCPU1, 1);
	var html2 = convertCacheToHTML(globalCacheCPU2, 2);
	//var htmlMem = convertMemoryToHTML(globalMemory, globalMemoryWidth);
	$('#cache-grid')[0].innerHTML = html1;
	$('#cache-grid2')[0].innerHTML = html2;
	//$('#main-memory-grid')[0].innerHTML = htmlMem;

	setTableEntryColors(globalCacheCPU1, 1);
	setTableEntryColors(globalCacheCPU2, 2);
    updateBitDisplay();
}

function updateBitDisplay() {
	var byteOffsetBits = Math.log2(getWordSize());
	var blockOffsetBits = Math.log2(getBlockSize());
	var indexBits = Math.log2(getCacheLineCount());
	var tagBits = getWordSize() * 8 - byteOffsetBits - blockOffsetBits - indexBits;

    $('#byteb').html(byteOffsetBits);
    $('#blockb').html(blockOffsetBits);
    $('#index').html(indexBits);
    $('#tag').html(tagBits);
}

// TODO: Move to js/memory_ui.js
$('document').ready(
	function() {
        Srand.seed(SEED);

        var wordSize = getWordSize();
        var wordsPerLine = getBlockSize(); // One block per line always, because associativity is always 1.
        var cacheLineCount = getCacheLineCount();
        console.log('wordsPerLine: ' + wordsPerLine);
        console.log('cacheLineCount: ' + cacheLineCount);
		
		globalMemory = new MemoryObj(wordSize, 1000);
        
		updateCaches();

		// Save the contents of the instructions tab in a variable. The contents
		// the instruction tab are overwritten whenever the user mouses over an
		// entry in the cache; but are restored when the user isn't mousing over anything.
		originalInstructionTabTitle = $('#instructions-title')[0].innerHTML;
		originalInstructionTabText = $('#instructions-body')[0].innerHTML;

		// Enable all tooltips in the cache table.
		//$("td").tooltip();
		$("[data-toggle='tooltip']").tooltip();
	});

function getByteInfoHTML(idStr) {

	byteId = idToByte(idStr);
	var lineNum = byteId.lineNum;
	var wordIndex = byteId.wordIndex;
	var byteOffset = byteId.byteOffset;
	// TODO: Figure out which CPU we're working with.
	var wordObj = globalCacheCPU1.getWord(lineNum, wordIndex);
	if (wordObj.getState() == MsiState.Invalid) {
		return "<p>This word is not tracking any words in main memory.</p>";
	}

	var wordAddress = wordObj.getAddress();
	//var wordAddress = globalCacheCPU1.getWord(lineNum, wordIndex).getAddress();

	var lineNumDisplay = "<b>Line Number: </b>" + lineNum;
	var wordIndexDisplay = "<b>Word Index: </b>" + wordIndex;
	var wordAddressDisplay = "<b>Word Address: </b>" + intToHex(wordAddress, 8);
	var byteOffsetDisplay = "<b>Byte Offset: </b>" + byteOffset;
	var html = "<p>" + lineNumDisplay + "</br>" + wordIndexDisplay + "</br>" + byteOffsetDisplay + "</p>";
	html += "<p>" + wordAddressDisplay + "</p>";

	return html;
}

function replaceInstructions(html) {
	// Overwrite the current instruction tab with stuff.
	$('#instructions-title')[0].innerHTML = "Detailed info";
	$('#instructions-body')[0].innerHTML = html;
}

function restoreInstructions() {
	// Restore the instruction stuff.
	$('#instructions-title')[0].innerHTML = originalInstructionTabTitle;
	$('#instructions-body')[0].innerHTML = originalInstructionTabText;
}

function gridMouseClick(source) {
	// Deselect anything already selected.
	prevSelection = $('.grid-byte-selected')[0];
	if (prevSelection != undefined) {
		prevSelection.classList.remove("grid-byte-selected");
	}

	// Check if the user just clicked the same element as before.
	if (source == prevSelection) {
		restoreInstructions();
	} else {
		source.classList.add("grid-byte-selected");
		replaceInstructions(getByteInfoHTML(source.id));
	}
}
