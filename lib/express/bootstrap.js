const logger = require('morgan');
const config = require('../config.js');
const setupViews = require('./engine.js');

module.exports.init = function bootstrapExpress(instance) {
	setupViews(instance);
	const env = config.get('env');
	instance.set('env', env);
	instance.disable('x-powered-by');

	const secure = config.get('secure', false);

	if (secure) {
		instance.set('trust proxy', 1);
	}

	instance.use(logger(env === 'development' ? 'dev' : 'short'));
};
