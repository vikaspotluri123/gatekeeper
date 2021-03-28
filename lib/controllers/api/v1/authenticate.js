
const {jsonResponse, getUrl} = require('../../../utils');
const {v1: api} = require('../../../api');

module.exports = function authenticateUser(req, res, next) {
	if (!req.query.redirect) {
		return jsonResponse.badRequest(null, res, null, 'Redirect URL must be supplied');
	}

	let {redirect} = req.query;
	redirect = decodeURI(redirect);
	// Default to HTTPS if a protocol isn't supplied
	if (!redirect.startsWith('http')) {
		redirect = `https://${redirect}`;
	}

	if (!api.findDomain(redirect)) {
		return jsonResponse.badRequest(null, res, null, 'Redirect URL is not authorized');
	}

	if (!res.locals.authenticated) {
		if (!req.session.token) {
			req.session.token = {
				create: true,
				redirect
			};
		}

		return res.redirect(getUrl('login'));
	}

	req.tokenRedirect = redirect;

	next();
};
