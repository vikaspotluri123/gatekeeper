const debug = require('debug')('vikas-auth:middleware');
const api = require('../api/v1');

module.exports = function checkAccess(req, res, next) {
	debug('Checking', req.url);
	const hasAccess = api.checkAccess(req.url, req.user);

	if (hasAccess) {
		return next();
	}

	const error = new Error('You do not have permission to view this resource');
	error.code = 403;
	next(error);
}
