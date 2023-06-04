import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {addCspStyles, escape, minify, hash} from '../utils/index.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const stylePath = path.resolve(__dirname, './styles.css');
let styles;

readFile(stylePath, 'utf8').then(data => {
	// Very basic minification - get rid of tabs and line breaks, the ending semicolon and excess space
	styles = data.replace(/[\n\t]/g, '').replace(/ ?([:{,]) ?/g, '$1').replace(/;}/g, '}');
	addCspStyles(`sha256-${hash(styles)}`);
});

const template = minify(`<!DOCTYPE html>
<html lang="en">
	<head>
		<title>{title}</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<style>{styles}</style>
	</head>
	<body>
		<main>
			<div class="content">
				{content}
			</div>
		</main>
		<footer>
			Powered by <a href="https://github.com/vikaspotluri123/gatekeeper" target="_blank" rel="noopener noreferrer">Gateekeeper Authentication</a>
		</footer>
	</body>
</html>`);

export function layout(content, {name}) {
	if (!styles) {
		return 'Service is starting up, please refresh in a minute';
	}

	return template.replace('{title}', escape(name))
		.replace('{styles}', styles)
		.replace('{content}', content);
}
