/* global document */

function toggleNav() {
	const nav = document.querySelector('.js-main-nav');
	const auxNav = document.querySelector('.js-aux-nav');
	const navTrigger = document.querySelector('.js-main-nav-trigger');
	const states = ['Hide', 'Menu'];
	let state = 1;

	navTrigger.addEventListener('click', () => {
		state = !state;

		nav.classList.toggle('nav-open');
		auxNav.classList.toggle('nav-open');
		navTrigger.classList.toggle('nav-open');
		navTrigger.innerText = states[Number(state)];
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', toggleNav);
} else {
	toggleNav();
}
