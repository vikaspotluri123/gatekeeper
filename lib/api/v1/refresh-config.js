import * as config from '../../config.js';
import {debug} from './debug.js';

export function refreshConfig() {
	debug('Refreshing config');
	return config._refresh();
}
