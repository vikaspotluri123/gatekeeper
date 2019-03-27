const debug = require('debug')('vikas-auth:middleware');
const {jsonResponse} = require('../utils');
const session = require('./session');

module.exports.session = session;
module.exports.requireLogin = [...session, function ensureLoggedIn(req, res, next) {
	if (res.locals.authenticated) {
		debug('requireLogin - authenticated');
		return next();
	}

	if (req.isAPIRequest) {
		return jsonResponse.authRequired(null, res);
	}

	if (req.path === '/logout') {
		return res.redirect('/');
	}

	debug('requireLogin - not authenticated');
	res.redirect('/login');
}];

module.exports.requireLogout = [...session, function ensureLoggedOut(req, res, next) {
	if (res.locals.authenticated) {
		debug('requireLogout - authenticated');
		return res.render('authed', {email: req.user});
	}

	debug('requireLogout - not authenticated');
	next();
}];
