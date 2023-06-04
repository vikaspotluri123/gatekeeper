import createDebug from 'debug';
import {jsonResponse, csp, getUrl} from '../utils/index.js';
import * as config from '../config.js';
import {session} from './session.js';
const debug = createDebug('vikas-auth:middleware');

export {session};

export const requireLogin = [
	...session,
	/**
	 * @param {import('express').Request} request
	 * @param {import('express').Response} response
	 * @param {import('express').NextFunction} next
	 */
	function ensureLoggedIn(request, response, next) {
		const LOGOUT_PATH = getUrl('logout');

		if (response.locals.authenticated) {
			debug('requireLogin - authenticated');
			return next();
		}

		if (request.isAPIRequest) {
			return jsonResponse.authRequired(null, response);
		}

		if (request.path === LOGOUT_PATH) {
			return response.redirect(getUrl(''));
		}

		if (!request.path.startsWith(config.get('basePath'))) {
			request.session.next = request.path;
			return response.redirect(getUrl(''));
		}

		debug('requireLogin - not authenticated');
		response.redirect(getUrl('login'));
	}
];

export const requireLogout = [
	...session,
	/**
	 * @param {import('express').Request} request
	 * @param {import('express').Response} response
	 * @param {import('express').NextFunction} next
	 */
	function ensureLoggedOut(request, response, next) {
		if (response.locals.authenticated) {
			debug('requireLogout - authenticated');
			return response.render('authed', {email: request.user});
		}

		debug('requireLogout - not authenticated');
		next();
	}
];

/**
 * @param {import('express').Request} _
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
export const securityHeaders = function addSecurityHeaders(_, response, next) {
	response.header('Content-Security-Policy', csp());
	response.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.header('X-Frame-Options', 'SAMEORIGIN');
	response.header('X-Content-Type-Options', 'nosniff');
	response.header('X-XSS-Protection', '1; mode=block');

	next();
};
