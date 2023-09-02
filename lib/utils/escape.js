// Modified version of handlebars escapeExpression
// @link https://raw.githubusercontent.com/wycats/handlebars.js/148b19182d70278237a62d8293db540483a0c46c/lib/handlebars/utils.js
const charMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#x27;',
	'`': '&#x60;',
	'=': '&#x3D;',
};

const badChars = /[&<>"'`=]/g;
const possible = /[&<>"'`=]/;

const escapeChar = char => charMap[char];

export function escapeExpression(string) {
	if (typeof string !== 'string') {
		if (string && string.toHTML) {
			return string.toHTML();
		}

		if (string === null) {
			return '';
		}

		if (!string) {
			return String(string);
		}

		string = String(string);
	}

	if (possible.test(string)) {
		return string.replaceAll(badChars, escapeChar);
	}

	return string;
}
