const {sep, resolve} = require('path');

const views = {
	authed: require('../views/authed'),
	error: require('../views/error'),
	home: require('../views/home')
};

const VIEWS = Object.keys(views);

function render(view, context) {
	if (!VIEWS.includes(view)) {
		throw new Error(`[vikas-auth] View ${view} does not exist`);
	}

	return views[view](context);
}

module.exports = function setupExpressViewEngine(app) {
	app.engine('js', (filePath, options, callback) => {
		const view = filePath.split(sep).pop().replace('.js', '');
		try {
			callback(null, render(view, options));
		} catch (error) {
			callback(error);
		}
	});

	app.set('views', resolve(__dirname, '../views'));
	app.set('view engine', 'js');
};
