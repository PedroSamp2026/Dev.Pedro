const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-link');
const siteHeader = document.querySelector('.site-header');
const scrollProgress = document.querySelector('.scroll-progress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let mouseFrame = null;

const smoothScrollTo = (targetPosition, duration = 1600) => {
    if (prefersReducedMotion) {
        window.scrollTo(0, targetPosition);
        return;
    }

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

const updateMousePosition = event => {
    if (prefersReducedMotion || mouseFrame) {
        return;
    }

    mouseFrame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        const tiltY = ((event.clientX / window.innerWidth) - 0.5) * 10;
        const tiltX = ((event.clientY / window.innerHeight) - 0.5) * -10;

        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        document.documentElement.style.setProperty('--tilt-x', `${tiltX}deg`);
        document.documentElement.style.setProperty('--tilt-y', `${tiltY}deg`);

        mouseFrame = null;
    });
};

window.addEventListener('pointermove', updateMousePosition);

const closeMenu = () => {
    if (!navToggle || !siteNav || !siteNav.classList.contains('open')) {
        return;
    }

    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = 'Menu';
};

const updateScrollUi = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    if (scrollProgress) {
        document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(3));
    }

    if (siteHeader) {
        siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
    }
};

window.addEventListener('scroll', updateScrollUi);
window.addEventListener('resize', updateScrollUi);
updateScrollUi();

if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.textContent = isOpen ? 'Fechar menu' : 'Menu';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
            link.blur();
        });
    });

    document.addEventListener('click', event => {
        const clickedInsideMenu = siteNav.contains(event.target);
        const clickedToggle = navToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && siteNav.classList.contains('open')) {
            closeMenu();
            navToggle.focus();
        }
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
            const isActive = link.getAttribute('href') === `#${currentSection?.id}`;
            link.classList.toggle('active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', highlightCurrentSection);
    window.addEventListener('resize', highlightCurrentSection);
    highlightCurrentSection();
}

if (sections.length) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.18,
            rootMargin: '0px 0px -80px 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    } else {
        sections.forEach(section => section.classList.add('is-visible'));
    }
}

document.querySelectorAll('.primary-button, .secondary-button, .nav-link').forEach(button => {
    button.addEventListener('click', event => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const targetId = button.getAttribute('href');
        const targetElement = targetId?.startsWith('#') ? document.querySelector(targetId) : null;

        if (targetElement) {
            event.preventDefault();
            const scrollDuration = button.classList.contains('nav-link') ? 1900 : 1500;
            smoothScrollTo(targetElement.offsetTop - 90, scrollDuration);
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
        backToTop.classList.toggle('show', window.scrollY > 220);
    };

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();

    backToTop.addEventListener('click', (event) => {
        event.preventDefault();
        smoothScrollTo(0, 1800);
    });
}
