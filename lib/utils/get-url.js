const {URL} = require('url');
const config = require('../config');

module.exports = function getUrl(path) {
	const base = new URL(config.get('baseUrl'));

	return base.resolve(base, path);
};
