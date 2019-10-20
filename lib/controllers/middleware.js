const debug = require('debug')('vikas-auth:middleware');
const url = require('url');
const api = require('../api/v1');

const getUrl = req => url.format({
	protocol: req.protocol,
	host: req.get('host'),
	pathname: req.originalUrl
});

module.exports = function checkAccess(req, res, next) {
	const _url = getUrl(req);
	debug('Checking', _url);
	const hasAccess = api.checkAccess(_url, req.user);

	if (hasAccess) {
		return next();
	}

	const error = new Error('You do not have permission to view this resource');
	error.code = 403;
	next(error);
}
