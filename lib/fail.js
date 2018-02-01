'use strict';

module.exports = function fail(err, req, res, next) {
	console.log('failing');
	res.status(404).json({
		status: 'error',
		message: 'The requested resource could not be found',
		code: 404
	});
}