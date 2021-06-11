const api = require('../../../api/v1/index.js');
const config = require('../../../config.js');
const {jsonResponse} = require('../../../utils/index.js');

module.exports = async function refreshConfigIfAllowed(req, res) {
	if (config.get('admins').includes(req.user)) {
		if (await api.refreshConfig()) {
			return jsonResponse.ok(null, res, null, 'Config was successfully refreshed');
		}

		return jsonResponse.internalError(
			null, res, null, 'Failed to refresh config. Check your logs for more information'
		);
	}

	return jsonResponse.noAccess(null, res);
};
