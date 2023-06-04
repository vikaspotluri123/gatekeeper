import {minify, escape, getUrl} from '../utils/index.js';
import {layout} from './layout.js';

const INTERSTITIAL_MESSAGE = 'You need to be logged in to access this resource';
const GENERIC_MESSAGE = 'You are not logged in';

const loggedOutUserTemplate = minify(`
	<p>{message}</p>
	<a class="btn" href="${getUrl('login')}">Log In</a>
`);

const loggedInTemplate = minify(`
	<p>You're logged in as <span class="emph">{user}</span></p>
	<form method="POST" action="${getUrl('logout')}">
		<input class="btn ptr" type="submit" value="Log Out" />
	</form>
`);

const template = minify(`
	<h1>{name}</h1>
	{context}
`);

function index({name, user, isInterstitial}) {
	const contextText = user ?
		loggedInTemplate.replace('{user}', escape(user)) :
		loggedOutUserTemplate.replace('{message}', isInterstitial ? INTERSTITIAL_MESSAGE : GENERIC_MESSAGE);
	return template.replace('{name}', escape(name)).replace('{context}', contextText);
}

export function proxyIndex(context) {
	return layout(index(context), context);
}
