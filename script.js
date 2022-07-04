const sections = document.querySelectorAll('section');
const viewTabs = [...document.querySelectorAll('footer div')];

function displaySection(btnIndex) {
  sections.forEach((section, sectionIndex) => {
    section.style.display = btnIndex === sectionIndex ? 'block' : 'none';
  });
}

function selectTab(btn) {
  viewTabs.forEach((btn) => {
    if (btn.id === 'active-tab') btn.removeAttribute('id');
  });

  btn.id = 'active-tab';
}

viewTabs.forEach((btn, btnIndex) => {
  btn.addEventListener('click', () => {
    selectTab(btn);
    displaySection(btnIndex);
  });
});