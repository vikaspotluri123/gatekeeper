import logger from 'morgan';
import * as config from '../config.js';
import {setupExpressViewEngine as setupViews} from './engine.js';

export function bootstrapExpress(instance) {
	setupViews(instance);
	const env = config.get('env');
	instance.set('env', env);
	instance.disable('x-powered-by');

	const secure = config.get('secure', false);

	if (secure) {
		instance.set('trust proxy', 1);
	}

	instance.use(logger(env === 'development' ? 'dev' : 'short'));
}
