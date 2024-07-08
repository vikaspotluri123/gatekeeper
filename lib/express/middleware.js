import createDebug from 'debug';
import {jsonResponse, csp, getUrl} from '../utils/index.js';
import * as config from '../config.js';
import {INVALID_TOKEN, getCookieFromToken} from '../controllers/api/v1/token.js';
import {session} from './session.js';
import conditionalMiddleware from './conditional-middleware.js';

const debug = createDebug('vikas-auth:middleware');

const COOKIE_NAME = config.safe.cookie;

/**
 * @param {import('../config/types.js').UserFromRequestFunction} altGetUserFromRequest
 * @returns {import('./conditional-middleware.js').Conditional}
 */
function altGetUser(altGetUserFromRequest) {
	return async (request, response) => {
		const newLocals = await altGetUserFromRequest(request);

		if (newLocals) {
			debug('loaded user via alternative method');
			response.locals.authenticated = newLocals.authenticated;
			response.locals.user = newLocals.user;
			request.user = newLocals.user;
		}

		// We need to run the session middleware if we didn't get a user
		return !newLocals;
	};
}

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
export function ensureLoggedIn(request, response, next) {
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

/**
* @param {import('express').Request} request
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function ensureLoggedOut(request, response, next) {
	if (response.locals.authenticated) {
		debug('requireLogout - authenticated');
		return response.render('authed', {email: request.user});
	}

	debug('requireLogout - not authenticated');
	next();
}

/**
 * @param {import('../config/types.js').UserFromRequestFunction} [altGetUserFromRequest]
 */
export function createAuthAssertions(altGetUserFromRequest) {
	if (!altGetUserFromRequest) {
		return {
			requireLogin: [...session, ensureLoggedIn],
			requireLogout: [...session, ensureLoggedOut],
		};
	}

	const getUser = conditionalMiddleware(altGetUser(altGetUserFromRequest), session);
	return {
		requireLogin: [getUser, ensureLoggedIn],
		requireLogout: [getUser, ensureLoggedOut],
	};
}

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

const enableExperimentalAutomaticTokenSwap = config.get('experimentalAutomaticTokenSwap') === true;
/**
 * @type {(request: import('express').Request, response: import('express').response, url: URL) => boolean}
 */
const setTokenSwapHeader = config.get('tokenSwapAddLocationHeader') ? (request, response, url) => {
	if (request.query?.redirect === 'false') {
		return false;
	}

	const status = request.query?.response === 'redirect' ? 302 : 401;

	url.searchParams.delete('token');
	response.setHeader('location', url.href);
	response.status(status);
	response.end();
	return true;
} : () => false;

/**
	* @param {import('express').Request} request
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
export const tokenSwap = (request, response, next) => {
	if (!enableExperimentalAutomaticTokenSwap) {
		next();
		return;
	}

	// CASE: client opted out of this feature
	// CASE: Our cookie is already set, token swap is ignored
	// CASE: URL param was not supplied, or it does not have the token
	if (
		request.query?.tokenSwap === 'false'
		|| request.headers.cookie?.includes(COOKIE_NAME)
		|| !request.params.url?.includes('token')
	) {
		next();
		return;
	}

	let url;

	try {
		url = new URL(request.params.url);
	} catch {
		next(new Error('Invalid URL to check'));
		return;
	}

	return getCookieFromToken(url.searchParams.get('token')).then(maybeCookie => {
		if (!(maybeCookie && maybeCookie !== INVALID_TOKEN)) {
			next();
			return;
		}

		if ()

		const existingCookie = request.headers.cookie;
		const cookie = `${COOKIE_NAME}=${maybeCookie}`;
		request.headers.cookie = existingCookie ? `${existingCookie}; ${cookie}` : cookie;

		if (!setTokenSwapHeader(request, response, url)) {
			next();
		}
	}).catch(next);
};

export {session} from './session.js';
