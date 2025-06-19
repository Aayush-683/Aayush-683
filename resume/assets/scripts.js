const themeSwitch = document.getElementById('theme-switch'); // Desktop theme switch
const themeLabel = document.getElementById('theme-label');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');
const sunRays = [
    document.getElementById('sun-rays-1'),
    document.getElementById('sun-rays-2'),
    document.getElementById('sun-rays-3'),
    document.getElementById('sun-rays-4'),
    document.getElementById('sun-rays-5'),
    document.getElementById('sun-rays-6'),
    document.getElementById('sun-rays-7'),
    document.getElementById('sun-rays-8'),
];

const themeSwitchMobile = document.getElementById('theme-switch-mobile'); // Mobile theme switch
const themeLabelMobile = document.getElementById('theme-label-mobile');
const iconMoonMobile = document.getElementById('icon-moon-mobile');
const iconSunMobile = document.getElementById('icon-sun-mobile');

const resumeIframe = document.getElementById('pdf-container');
const iframeSpinner = document.getElementById('iframe-spinner');

const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const body = document.body;

function showSunIcon(isMobile = false) {
    if (isMobile) {
        iconMoonMobile.style.display = 'none';
        iconSunMobile.style.display = 'block';
    } else {
        iconMoon.style.display = 'none';
        iconSun.style.display = 'block';
    }
}

function showMoonIcon(isMobile = false) {
    if (isMobile) {
        iconMoonMobile.style.display = 'block';
        iconSunMobile.style.display = 'none';
    } else {
        iconMoon.style.display = 'block';
        iconSun.style.display = 'none';
    }
}

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light');
        themeSwitch.checked = true;
        themeSwitchMobile.checked = true;
        themeLabel.textContent = 'Light Mode';
        themeLabelMobile.textContent = 'Light Mode';
        showSunIcon(false); // Desktop
        showSunIcon(true);  // Mobile
    } else {
        body.classList.remove('light');
        themeSwitch.checked = false;
        themeSwitchMobile.checked = false;
        themeLabel.textContent = 'Dark Mode';
        themeLabelMobile.textContent = 'Dark Mode';
        showMoonIcon(false); // Desktop
        showMoonIcon(true);  // Mobile
    }
    localStorage.setItem('theme', theme);
}

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || 'dark'); // Default to dark if no theme is saved

// Event listeners for theme switches
themeSwitch.addEventListener('change', () => {
    applyTheme(themeSwitch.checked ? 'light' : 'dark');
});

themeSwitchMobile.addEventListener('change', () => {
    applyTheme(themeSwitchMobile.checked ? 'light' : 'dark');
});

// Handle iframe loading for spinner
resumeIframe.onload = () => {
    iframeSpinner.style.display = 'none';
    resumeIframe.classList.add('loaded'); // Apply opacity transition
};

// Fallback for immediate iframe content if load event doesn't fire fast enough
setTimeout(() => {
    if (!resumeIframe.classList.contains('loaded')) {
        iframeSpinner.style.display = 'none';
        resumeIframe.classList.add('loaded');
    }
}, 1000);

// Mobile menu toggle functionality
menuToggle.addEventListener('click', () => {
    body.classList.toggle('menu-open');
});

// Close mobile menu when clicking inside the menu
mobileNav.addEventListener('click', (event) => {
    if (event.target === mobileNav) {
        body.classList.remove('menu-open');
    }
});

// PDF.js setup

// Ensure PDF.js is loaded
if (typeof pdfjsLib === 'undefined' || typeof pdfjsViewer === 'undefined') {
    console.error('PDF.js library is not loaded.');
}

const pdfUrl = 'https://aayush-683.github.io/resume/assets/resume.pdf';

const CMAP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/';
const CMAP_PACKED = true;

const loadingTask = pdfjsLib.getDocument({
    url: pdfUrl,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED
});

loadingTask.promise.then((pdf) => {
    const eventBus = new pdfjsViewer.EventBus();
    const linkService = new pdfjsViewer.PDFLinkService({ eventBus });

    const viewer = new pdfjsViewer.PDFViewer({
        container: document.getElementById('pdf-container'),
        eventBus,
        linkService,
    });

    linkService.setViewer(viewer);
    viewer.setDocument(pdf);

    // Set zoom after document is loaded
    viewer.currentScaleValue = 'page-width';  // or 'page-fit'
});
