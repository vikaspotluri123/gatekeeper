const config = require('../config.js');

module.exports = function getUrl(urlPath) {
	const root = `http://z${config.get('basePath', '/')}`;
	return new URL(urlPath, root).pathname;
};
