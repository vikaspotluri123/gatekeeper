const debug = require('debug')('vikas-auth:middleware');
const {jsonResponse, csp, getUrl} = require('../utils');
const session = require('./session');

module.exports.session = session;
module.exports.requireLogin = [...session, function ensureLoggedIn(req, res, next) {
	const LOGOUT_PATH = getUrl('logout');

	if (res.locals.authenticated) {
		debug('requireLogin - authenticated');
		return next();
	}

	if (req.isAPIRequest) {
		return jsonResponse.authRequired(null, res);
	}

	if (req.path === LOGOUT_PATH) {
		return res.redirect(getUrl('/'));
	}

	debug('requireLogin - not authenticated');
	res.redirect(getUrl('login'));
}];

module.exports.requireLogout = [...session, function ensureLoggedOut(req, res, next) {
	if (res.locals.authenticated) {
		debug('requireLogout - authenticated');
		return res.render('authed', {email: req.user});
	}

	debug('requireLogout - not authenticated');
	next();
}];

module.exports.securityHeaders = function addSecurityHeaders(_, res, next) {
	res.header('Content-Security-Policy', csp.value);
	res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.header('X-Frame-Options', 'SAMEORIGIN');
	res.header('X-Content-Type-Options', 'nosniff');
	res.header('X-XSS-Protection', '1; mode=block');

	next();
};
