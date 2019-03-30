const {resolve} = require('path');
const {readFile} = require('fs');
const {csp, escape} = require('../utils');

const stylePath = resolve(__dirname, './styles.css');
let styles = false;

readFile(stylePath, 'utf8', (_, data) => {
	// Very basic minification - get rid of tabs and line breaks, the ending semicolon and excess space
	data = data.replace(/[\n\t]/g, '').replace(/ ?([:{,]) ?/g, '$1').replace(/;}/g, '}');
	styles = data;

	const hash = require('crypto').createHash('sha256').update(data).digest('base64');
	csp.value = `sha256-${hash}`;
});

module.exports = function layout(content, {name}) {
	if (!styles) {
		return 'Service is starting up, please refresh in a minute';
	}

	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<title>${escape(name)}</title>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="X-UA-Compatible" content="ie=edge">
			<style>${styles}</style>
		</head>
		<body>
			<main>
				<div class="content">
					${content}
				</div>
			</main>
			<footer>
				Powered by <a href="https://github.com/vikaspotluri123/gatekeeper" target="_blank" rel="noopener noreferrer">Gateekeeper Authentication</a>
			</footer>
		</body>
	</html>`;
};
