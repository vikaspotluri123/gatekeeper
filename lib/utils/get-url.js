const url = require('url');
const config = require('../config');

module.exports = function getUrl(urlPath) {
	const root = config.get('basePath', '/');
	return url.resolve(root, urlPath);
};
