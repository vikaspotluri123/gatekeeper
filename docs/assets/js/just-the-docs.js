// Event handling

function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}
function removeEvent(el, type, handler) {
    if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
}

// Show/hide mobile menu

function toggleNav(){
  const nav = document.querySelector('.js-main-nav');
  const auxNav = document.querySelector('.js-aux-nav');
  const navTrigger = document.querySelector('.js-main-nav-trigger');

  addEvent(navTrigger, 'click', function(){
    var text = navTrigger.innerText;
    var textToggle = navTrigger.getAttribute('data-text-toggle');

    nav.classList.toggle('nav-open');
    auxNav.classList.toggle('nav-open');
    navTrigger.classList.toggle('nav-open');
    navTrigger.innerText = textToggle;
    navTrigger.setAttribute('data-text-toggle', text);
    textToggle = text;
  })
}

function pageFocus() {
  var mainContent = document.querySelector('.js-main-content');
  mainContent.focus();
  console.log(mainContent)
}

// Document ready
function ready(){
  toggleNav();
  pageFocus();
}

// in case the document is already rendered
if (document.readyState!='loading') ready();
// modern browsers
else if (document.addEventListener) document.addEventListener('DOMContentLoaded', ready);
// IE <= 8
else document.attachEvent('onreadystatechange', function(){
    if (document.readyState=='complete') ready();
});
