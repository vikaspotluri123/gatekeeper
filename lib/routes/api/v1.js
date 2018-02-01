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

router.get('/authenticatedFor/:service/', (req, res) => {
	const service = req.params.service.toLowerCase().replace(/[^a-z]/g,'');
	console.log(service);
	res.status(200).json({
		type: 'info',
		message: service,
		code: 401
	});
});

module.exports = router;
