const express = require('express');
const router = express.Router();
const cors = require('cors');

// router.use(cors());

router.use((req, res, next) => {
	if(!(req.user && req.isAuthenticated())) {
		res.status(401).json({
			type: 'error',
			message: 'You must be logged in to view this resource',
			code: 401
		});
	} else {
		next();
	}
});

// With HTTP-Only requests we get the url from
// the `x-original-uri` header
router.get('/http', (req, res, next) => {
	if(!req.headers['x-original-uri'])
		return next();
	console.log(req.headers);
	res.status(200).json({
		type: 'info',
		message: service,
		code: 200
	});
});

// With HTTP-Only requests only 2xx, 401 and 403 response codes are allowed
router.use('/http', (req, res) => res.status(401).send('not-ok'));


router.get('/authenticatedFor/:url', (req, res) => {
	console.log(req.params.url);
	res.status(200).json({
		type: 'info',
		message: req.params.url,
		code: 200
	});
});

module.exports = router;
