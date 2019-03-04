const passport = require('passport');

module.exports = {
	outgoing: passport.authenticate('google', {scope: ['email']}),
	incoming: passport.authenticate('google'),
	terminate: function logout(req, res) {
		req.logout();
		res.redirect('/');
	},
	redirect(_, res) {
		return res.redirect('/');
	}
};
