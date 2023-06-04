import {jsonResponse, getUrl} from '../../../utils/index.js';
import {v1 as api} from '../../../api/index.js';

/**
 * @type {import('express').RequestHandler}
 */
export function authenticateUser(request, response, next) {
	if (!request.query.redirect) {
		return jsonResponse.badRequest(null, response, null, 'Redirect URL must be supplied');
	}

	let {redirect} = request.query;
	if (typeof redirect !== 'string') {
		redirect = '';
	}

	redirect = decodeURI(redirect);
	// Default to HTTPS if a protocol isn't supplied
	if (!redirect.startsWith('http')) {
		redirect = `https://${redirect}`;
	}

	if (!api.findDomain(redirect)) {
		return jsonResponse.badRequest(null, response, null, 'Redirect URL is not authorized');
	}

	if (!response.locals.authenticated) {
		if (!request.session.token) {
			request.session.token = {
				create: true,
				redirect,
			};
		}

		if (request.query.warn) {
			const queryAsString = request.query.warn.toString();

			if (queryAsString !== 'false' && queryAsString !== '0') {
				request.session.token.isInterstitial = true;
				return response.redirect(getUrl(''));
			}
		}

		return response.redirect(getUrl('login'));
	}

	request.tokenRedirect = redirect;

	next();
}
