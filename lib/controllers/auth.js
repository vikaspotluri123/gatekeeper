import passport from 'passport';
import {getUrl} from '../utils/index.js';

export const outgoing = passport.authenticate('google', {scope: ['email'], keepSessionInfo: true});
export const incoming = passport.authenticate('google', {keepSessionInfo: true});
export const terminate = function logout(req, res) {
	// Since we share cookies across domains, we need to destroy the session.
	// Passport's logout function only clears the passport data from the session, so manually reimplement
	// that function - remove the user and clear (in our case destroy) the session.
	req.user = null;
	req.session.destroy();
	res.redirect('/');
};

export function redirect(req, res) {
	let {next} = req.session;

	next ||= getUrl('');

	return res.redirect(next);
}
