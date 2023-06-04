/**
 * @type {import('express').RequestHandler}
 */
export function home(req, res) {
	res.locals.isInterstitial = req.session.token?.isInterstitial;
	res.render('home');
}
