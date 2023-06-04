const DEFAULT_CSP = 'default-src none; img-src \'self\';';
let _csp = DEFAULT_CSP;

export function csp() {
	return _csp;
}

/** @param {string} styleSources */
export function addCspStyles(styleSources) {
	_csp += `style-src '${styleSources}`;
}
