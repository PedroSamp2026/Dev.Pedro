const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-link');

const smoothScrollTo = (targetPosition, duration = 1100) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const easeInOutCubic = progress => {
        return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    };

    const animateScroll = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };

    requestAnimationFrame(animateScroll);
};

if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.textContent = isOpen ? 'Fechar menu' : 'Menu';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (siteNav.classList.contains('open')) {
                siteNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.textContent = 'Menu';
            }
            link.blur();
        });
    });
}

const sections = document.querySelectorAll('main section[id]');

if (sections.length && navLinks.length) {
    const highlightCurrentSection = () => {
        const currentSection = Array.from(sections).find(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionBottom = sectionTop + section.offsetHeight;

            return window.scrollY >= sectionTop && window.scrollY < sectionBottom;
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentSection?.id}`);
        });
    };

    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection();
}

document.querySelectorAll('.primary-button, .secondary-button, .nav-link').forEach(button => {
    button.addEventListener('click', event => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const targetId = button.getAttribute('href');
        const targetElement = targetId?.startsWith('#') ? document.querySelector(targetId) : null;

        if (targetElement) {
            event.preventDefault();
            smoothScrollTo(targetElement.offsetTop - 90);
        }

        ripple.className = 'click-ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;

        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });
});

const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
    const toggleBackToTop = () => {
        backToTop.classList.toggle('show', window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();

    backToTop.addEventListener('click', (event) => {
        event.preventDefault();
        smoothScrollTo(0, 1200);
    });
}
