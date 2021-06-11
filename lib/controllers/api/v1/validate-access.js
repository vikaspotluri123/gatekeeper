const {v1: api} = require('../../../api/index.js');
const {jsonResponse} = require('../../../utils/index.js');

module.exports = function validateUserAccess(req, res) {
	const {url} = req.params;
	const {user} = req;

	if (api.checkAccess(url, user)) {
		return jsonResponse.ok(null, res);
	}

	jsonResponse.noAccess(null, res);
};
