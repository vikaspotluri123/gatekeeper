import {v1 as api} from '../../../api/index.js';
import {requireLogin} from '../../../express/middleware.js';
import {jsonResponse} from '../../../utils/index.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function validateUserAccess(req, res) {
	const {url} = req.params;
	const {user} = req;

	const cookieDomain = req.session?.cookie?.domain;
	const parsedUrl = new URL(url);

	// A user session is bound cross-domain to help reduce the re-auth period - once a user access any domain,
	// the backend auth session will be refreshed.
	if (
		cookieDomain
		&& !parsedUrl.hostname.endsWith(
			cookieDomain.startsWith('.') ? cookieDomain.slice(1) : cookieDomain,
		)
	) {
		// Since the cookie isn't properly configured, don't trigger a session refresh
		delete req.session;
		return jsonResponse.badRequest(
			null, res, null,
			'Domain mismatch for session. If you\'re using gatekeeper across multiple domains, do not set `cookieDomain`.',
		);
	}

	if (api.checkAccess(url, user)) {
		return jsonResponse.ok(null, res);
	}

	requireLogin(req, res, () => {
		jsonResponse.noAccess(null, res);
	});
}
