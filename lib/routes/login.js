const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
	if(req.user && req.isAuthenticated())
		res.render('alreadyAuthenticated', {email: req.user});
	else
		passport.authenticate('google', {
			scope: ['https://www.googleapis.com/auth/userinfo.email']
		})(req,res,next);
});

router.get('/callback', passport.authenticate('google'), (req, res) => res.redirect('/'));

module.exports = router;
