import url from 'node:url';
import createDebug from 'debug';
import {v1 as api} from '../api/index.js';
import {requireLogin} from '../express/middleware.js';
const debug = createDebug('vikas-auth:middleware');

const getUrl = req => url.format({
	protocol: req.protocol,
	host: req.get('host'),
	pathname: req.originalUrl
});

export default [requireLogin, function checkAccess(req, _res, next) {
	const _url = getUrl(req);
	debug('Checking', _url);
	const hasAccess = api.checkAccess(_url, req.user);

	if (hasAccess) {
		return next();
	}

	/** @type {any} */
	const error = new Error('You do not have permission to view this resource');
	error.code = 403;
	next(error);
}];
