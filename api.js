// @ts-check
import * as privateConfig from './lib/config.js';

export const config = {
	get: privateConfig.get,
	refreshing: privateConfig.refreshing,
};

export {createApp} from './lib/index.js';
export {useGatekeeper} from './lib/controllers/middleware.js';

// Type exports

/**
 * @typedef {import('./lib/config/types.js').UserFromRequestFunction} UserFromRequestFunction
 */
