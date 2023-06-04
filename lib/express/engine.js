import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {proxyAlreadyAuthenticated as authed} from '../views/authed.js';
import {proxyError as error} from '../views/error.js';
import {proxyIndex as home} from '../views/home.js';
import {proxyAlreadyAuthenticated as logout} from '../views/logout.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const views = {
	authed,
	error,
	home,
	logout
};

const VIEWS = Object.keys(views);

function render(view, context) {
	if (!VIEWS.includes(view)) {
		throw new Error(`[vikas-auth] View ${view} does not exist`);
	}

	return views[view](context);
}

export function setupExpressViewEngine(app) {
	app.engine('js', (filePath, options, callback) => {
		const view = filePath.split(path.sep).pop().replace('.js', '');
		try {
			callback(null, render(view, options));
		} catch (error) {
			callback(error);
		}
	});

	app.set('views', path.resolve(__dirname, '../views'));
	app.set('view engine', 'js');
}
