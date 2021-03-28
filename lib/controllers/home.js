/**
 * @type {import('express').RequestHandler}
 */
module.exports = function home(req, res) {
	res.locals.isInterstitial = req.session.token?.isInterstitial;
	res.render('home');
};
