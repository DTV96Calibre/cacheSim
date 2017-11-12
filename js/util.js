/*
  util.js
  https://github.com/DTV96Calibre/cacheSim
*/

// A collection of utility functions that may be useful in cache.js and elsewhere.

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
