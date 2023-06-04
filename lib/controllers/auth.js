import passport from 'passport';
import {getUrl} from '../utils/index.js';

export const outgoing = passport.authenticate('google', {scope: ['email'], keepSessionInfo: true});
export const incoming = passport.authenticate('google', {keepSessionInfo: true});
export const terminate = function logout(req, res) {
	req.logout();
	// Since we share cookies across domains, we need to destroy the session
	req.session.destroy();
	res.redirect('/');
};

export function redirect(req, res) {
	let {next} = req.session;

	if (!next) {
		next = getUrl('');
	}

	return res.redirect(next);
}
