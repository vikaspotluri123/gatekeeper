const DEFAULT_CSP = 'default-src none; img-src \'self\';';
let csp = DEFAULT_CSP;

module.exports = {
	get value() {
		return csp;
	},

	set value(value) {
		csp = `${DEFAULT_CSP} style-src '${value}'`;
	}
};
