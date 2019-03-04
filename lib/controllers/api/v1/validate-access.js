const {v1: api} = require('../../../api');
const {jsonResponse} = require('../../../utils');

module.exports = function validateUserAccess(req, res) {
	const {url} = req.params;
	const {user} = req;

	if (api.checkAccess(url, user)) {
		return jsonResponse.ok(null, res);
	}

	jsonResponse.noAccess(null, res);
};
