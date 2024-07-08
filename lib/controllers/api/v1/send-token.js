import {parse} from 'cookie';
import {v1 as api} from '../../../api/index.js';
import {safe as config} from '../../../config.js';

export async function acquireTokenAndRedirect(req, res, next) {
	try {
		if (req.session.token?.create || req.tokenRedirect) {
			const token = await api.token.create(
				parse(req.headers.cookie)[config.cookie],
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
