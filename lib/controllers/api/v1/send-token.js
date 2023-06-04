import {parse} from 'cookie';
import {v1 as api} from '../../../api/index.js';
import * as config from '../../../config.js';

export async function acquireTokenAndRedirect(req, res, next) {
	try {
		if ((req.session.token && req.session.token.create) || req.tokenRedirect) {
			const cookieName = config.get('cookie', 'private.auth.sid');
			const token = await api.token.create(
				parse(req.headers.cookie)[cookieName]
			);
			const redirectURL = new URL(req.tokenRedirect || req.session.token.redirect);
			redirectURL.searchParams.set('token', token);
			req.session.token = undefined;
			return res.redirect(redirectURL.toString());
		}

		next();
	} catch (error) {
		next(error);
	}
}
