import {v1 as api} from '../../../api/index.js';
import {requireLogin} from '../../../express/middleware.js';
import {jsonResponse} from '../../../utils/index.js';

export function validateUserAccess(req, res) {
	const {url} = req.params;
	const {user} = req;

	if (api.checkAccess(url, user)) {
		return jsonResponse.ok(null, res);
	}

	requireLogin(req, res, () => {
		jsonResponse.noAccess(null, res);
	});
}
