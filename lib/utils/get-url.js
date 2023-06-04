import * as config from '../config.js';

export function getUrl(urlPath) {
	const root = `http://z${config.get('basePath', '/')}`;
	return new URL(urlPath, root).pathname;
}
