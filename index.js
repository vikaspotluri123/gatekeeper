import {fileURLToPath} from 'node:url';
import {createApp} from './lib/index.js';
import * as config from './lib/config.js';

export async function startServer() {
	const {app} = await createApp();

	const port = process.env.PORT || config.get('port', '3000');

	app.set('port', port);
	app.listen(port, () => console.log('Listening on port', port));

	return app;
}

export const app = createApp;

if (
	import.meta.url.startsWith('file:') &&
	process.argv[1] === fileURLToPath(import.meta.url)
) {
	startServer();
}
