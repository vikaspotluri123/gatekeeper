const cors = require('cors');
const {findDomain} = require('../../../api/').v1;

function checkDomainValidity(origin, callback) {
	if (!origin) {
		const error = new Error('Origin must be provided for http authentication');
		error.status = 400;
		return callback(error);
	}

	if (!origin.startsWith('http')) {
		origin = `https://${origin}`;
	}

	const domainExists = findDomain(origin);

	if (domainExists) {
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
