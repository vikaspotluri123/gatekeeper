const cors = require('cors');
const matches = require('matcher').isMatch;
const config = require('../../../config');

function checkDomainValidity(origin, callback) {
	if (!origin) {
		const error = new Error('Origin must be provided for http authentication');
		error.status = 400;
		return callback(error);
	}

	if (config.get('domains').find(domain => matches(origin, domain))) {
		return callback(null, true);
	}

	const error = new Error(`Origin ${origin} does not have permission to access this resource`);
	error.status = 400;
	callback(error);
}

module.exports = cors({
	origin: checkDomainValidity,
	method: 'GET'
});
