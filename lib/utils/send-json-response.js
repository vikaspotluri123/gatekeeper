export const ok = function sendResponse(_, res, __, message = 'Welcome') {
	return res.status(200).json({
		type: 'info',
		message,
		code: 200
	});
};

export const badRequest = function sendResponse(_, res, __, message = 'Bad Request') {
	res.status(400).json({
		type: 'error',
		message,
		code: 400
	});
};

export const authRequired = function sendResponse(_, res) {
	res.status(401).json({
		type: 'error',
		message: 'You must be logged in to view this resource',
		code: 401
	});
};

export const noAccess = function sendResponse(
	_, res, __, message = 'You do not have permission to access this resource'
) {
	res.status(403).json({
		type: 'error',
		message,
		code: 403
	});
};

export const notFound = function sendResponse(_, res) {
	res.status(404).json({
		type: 'error',
		message: 'The requested resource could not be found',
		code: 404
	});
};

export const internalError = function sendResponse(
	_, res, __, message = 'An internal server error occurred. Check your logs for more information'
) {
	res.status(500).json({
		type: 'error',
		message,
		code: 500
	});
};
