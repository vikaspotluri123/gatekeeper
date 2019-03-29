const cors = require('cors');
const {jsonResponse} = require('../../../utils');
const {findDomain} = require('../../../api').v1;

class InternalCorsError extends Error{
	constructor(...args) {
		super(...args);
		this.status = 400;
	}
}

function checkDomainValidity(origin, callback) {
	if (!origin) {
		return callback(new InternalCorsError('Origin must be provided for http authentication'));
	}

	if (!origin.startsWith('http')) {
		origin = `https://${origin}`;
	}

	const domainExists = findDomain(origin);

	if (domainExists) {
		return callback(null, true);
	}

	callback(new InternalCorsError(`Origin ${origin} does not have permission to access this resource`));
}

const corsMiddleware = cors({
	origin: checkDomainValidity,
	method: 'GET'
});

module.exports = (req, res, next) => {
	corsMiddleware(req, res, (error, ...rest) => {
		if (error instanceof InternalCorsError) {
			return jsonResponse.badRequest(null, res, null, error.message);
		}

		next(error, ...rest);
	});
};
