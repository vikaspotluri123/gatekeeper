const passport = require('passport');
const {getUrl} = require('../utils');

module.exports = {
	outgoing: passport.authenticate('google', {scope: ['email']}),
	incoming: passport.authenticate('google'),
	terminate: function logout(req, res) {
		req.logout();
		// Since we share cookies across domains, we need to destroy the session
		req.session.destroy();
		res.redirect('/');
	},
	redirect(req, res) {
		let next = req.session.next;

		if (!next) {
			next = getUrl('');
		}

		return res.redirect(next);
	}
};
