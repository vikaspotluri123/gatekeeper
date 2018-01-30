var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	const flash = req.query.loggedOut && !(req.user && req.isAuthenticated()) ? 'You have been logged out' : '';
	res.render('index', { title: 'Express', flash});
});

module.exports = router;
