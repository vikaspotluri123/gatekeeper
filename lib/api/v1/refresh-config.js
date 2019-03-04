const config = require('../../config');
const debug = require('./debug');

module.exports = function refreshConfig() {
	debug('Refreshing config');
	return config._refresh();
};
