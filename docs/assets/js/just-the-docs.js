// Show/hide mobile menu
function toggleNav() {
  const nav = document.querySelector('.js-main-nav');
  const auxNav = document.querySelector('.js-aux-nav');
  const navTrigger = document.querySelector('.js-main-nav-trigger');

  navTrigger.addEventListener('click', function() {
    var text = navTrigger.innerText;
    var textToggle = navTrigger.getAttribute('data-text-toggle');

    nav.classList.toggle('nav-open');
    auxNav.classList.toggle('nav-open');
    navTrigger.classList.toggle('nav-open');
    navTrigger.innerText = textToggle;
    navTrigger.setAttribute('data-text-toggle', text);
    textToggle = text;
  });
}

function pageFocus() {
  var mainContent = document.querySelector('.js-main-content');
  mainContent.focus();
  console.log(mainContent)
}

// Document ready
function ready() {
  toggleNav();
  pageFocus();
}

if (document.readyState !== 'loading') {
	ready();
} else {
	document.addEventListener('DOMContentLoaded', ready)
}
