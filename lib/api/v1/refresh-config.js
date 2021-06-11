const config = require('../../config.js');
const debug = require('./debug.js');

module.exports = function refreshConfig() {
	debug('Refreshing config');
	return config._refresh();
};
