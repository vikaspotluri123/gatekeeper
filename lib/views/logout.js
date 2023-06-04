import {escape, minify, getUrl} from '../utils/index.js';
import {layout} from './layout.js';

const template = minify(`
	<h1>{name}</h1>
	<p>You are logged in{ifEmail}. Are you sure you want to log out?</p>
	<form method="POST" action="${getUrl('logout')}">
		<input type="submit" class="btn ptr green" value="Yes, log me out">
	</form>
`);

function alreadyAuthenticated({email, name}) {
	const emailText = email ? ` as <span class="emph">${escape(email)}</span>` : '';
	return template.replace('{name}', escape(name)).replace('{ifEmail}', emailText);
}

export function proxyAlreadyAuthenticated(context) {
	return layout(alreadyAuthenticated(context), context);
}
