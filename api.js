import * as privateConfig from './lib/config.js';

export const config = {
	get: privateConfig.get,
	refreshing: privateConfig.refreshing,
};

export {makeApp} from './lib/index.js';
export {useGatekeeper} from './lib/controllers/middleware.js';
