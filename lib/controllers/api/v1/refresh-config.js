// @ts-check
import * as api from '../../../api/v1/index.js';
import {safe as config} from '../../../config.js';
import {jsonResponse} from '../../../utils/index.js';

export async function refreshConfigIfAllowed(req, res) {
	if (config.admins.includes(req.user)) {
		if (await api.refreshConfig()) {
			return jsonResponse.ok(null, res, null, 'Config was successfully refreshed');
		}

		return jsonResponse.internalError(
			null, res, null, 'Failed to refresh config. Check your logs for more information',
		);
	}

	return jsonResponse.noAccess(null, res);
}
