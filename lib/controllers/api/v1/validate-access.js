import {v1 as api} from '../../../api/index.js';
import {safe as config} from '../../../config.js';
import {jsonResponse} from '../../../utils/index.js';

export function validateUserAccess(req, res) {
	const {url} = req.params;
	const {user} = req;

	if (api.checkAccess(url, user)) {
		return jsonResponse.ok(null, res);
	}

	jsonResponse.noAccess(null, res);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validatePublicAccess(req, res, next) {
	const {url} = req.params;
	if (!config.acl.potentialPublicUrlRegex?.test(url)) {
		next();
		return;
	}

	if (api.checkAccess(url, '', config.acl.public)) {
		jsonResponse.ok(null, res);
		return;
	}

	next();
}
