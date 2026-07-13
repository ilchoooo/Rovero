// ========================================
// NAV SIDEBAR — open/close logic
// Works on all pages
// ========================================

(function() {
    function initNavSidebar() {
        const btn = document.getElementById('menuOpenBtn');
        const closeBtn = document.getElementById('navCloseBtn');
        const overlay = document.getElementById('navOverlay');
        const sidebar = document.getElementById('navSidebar');

        if (!btn || !sidebar) return;

        // Set active class based on current page URL
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const currentSearch = decodeURIComponent(window.location.search);
        const currentFull = currentPath + currentSearch;

        let hasActive = false;
        const navLinks = sidebar.querySelectorAll('.nav-link');

        // First pass: try to find an exact match (path + search)
        navLinks.forEach(link => {
            const href = decodeURIComponent(link.getAttribute('href') || '');
            if (href === currentFull) {
                link.classList.add('active');
                hasActive = true;
            } else {
                link.classList.remove('active');
            }
        });

        // Second pass: if no exact match found, match path only
        if (!hasActive) {
            const matchPath = currentPath === 'product.html' ? 'catalog.html' : currentPath;
            navLinks.forEach(link => {
                const href = decodeURIComponent(link.getAttribute('href') || '');
                if (href === matchPath) {
                    link.classList.add('active');
                }
            });
        }


        function openNav() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        btn.addEventListener('click', openNav);
        if (closeBtn) closeBtn.addEventListener('click', closeNav);
        if (overlay) overlay.addEventListener('click', closeNav);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNav();
        });

        // Close sidebar when any nav link is clicked
        sidebar.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }

    function initHeaderScroll() {
        const header = document.getElementById('site-header');
        if (!header) return;

        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNavSidebar();
            initHeaderScroll();
        });
    } else {
        initNavSidebar();
        initHeaderScroll();
    }
})();
