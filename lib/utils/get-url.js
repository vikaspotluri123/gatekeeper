const config = require('../config');

module.exports = function getUrl(urlPath) {
	const root = config.get('basePath', '/');
	return new URL(urlPath, root).href;
};
