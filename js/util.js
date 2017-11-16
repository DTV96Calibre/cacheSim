/*
  util.js
  https://github.com/DTV96Calibre/cacheSim
*/

// A collection of utility functions that may be useful in cache.js and elsewhere.

function intToHex(num) {
	console.log("Warning! Use intToHex(num, length) instead!");
	return num.toString(16);
}

// Returns num as a hexadecimal string, padded to length characters by adding leading
// 0's.
function intToHex(num, length) {
	var ret = num.toString(16);
	while (ret.length < length) {
		ret = '0' + ret;
	}
	return ret;
}

function intToBinary(num) {
	console.log("Warning! Use intToBinary(num, length) instead!");
	return num.toString(2);
}

// Returns num as a binary string, padded to length characters by adding leading 0's.
function intToBinary(num, length) {
	var ret = num.toString(2);
	while (ret.length < length) {
		ret = '0' + ret;
	}
	return ret;
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
