const express = require('express');
const router = express.Router();
const cors = require('cors');
const fail = require('../../fail');

const v1 = require('./v1');

router.use('/v1', v1);
router.use(function(req, res, next) {
	console.log('failing');
	res.status(404).json({
		type: 'error',
		message: 'The requested resource could not be found',
		code: 404
	});
});

module.exports = router;