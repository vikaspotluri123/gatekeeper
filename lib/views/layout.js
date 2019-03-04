const {resolve} = require('path');
const {readFile} = require('fs');
const escape = require('../utils/escape');

const stylePath = resolve(__dirname, './styles.css');
let styles = '';

readFile(stylePath, 'utf8', (_, data) => {
	styles = data;
});

module.exports = function layout(content, {name}) {
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
			<div class="content">
				${content}
			</div>
		</body>
	</html>`;
};
