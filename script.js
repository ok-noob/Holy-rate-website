// Grab elements
const menuIcon = document.querySelector('.menu-icon');
const sidebar = document.querySelector('.sidebar');

// Toggle sidebar width on click
menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});