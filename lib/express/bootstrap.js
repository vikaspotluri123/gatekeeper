const logger = require('morgan');
const config = require('../config');
const setupViews = require('./engine');

module.exports.init = function bootstrapExpress(instance) {
	setupViews(instance);

	const secure = config.get('secure', false);

	if (secure) {
		instance.set('trust proxy', 1);
	}

	instance.use(logger('dev'));
};
