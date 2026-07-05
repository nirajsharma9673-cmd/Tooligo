// Theme Management System
const ThemeManager = {
    STORAGE_KEY: 'tooligo-theme',
    DARK_MODE_CLASS: 'dark-mode',

    init() {
        this.restoreTheme();
        this.setupToggle();
        this.initMobileNav();
        this.initToolSearch();
        this.handleScroll();
    },

    restoreTheme() {
        // Migrate any legacy theme keys (preserve user's preference)
        const migrated = !!localStorage.getItem(this.STORAGE_KEY);
        if (!migrated) {
            // Scan localStorage for any key that appears to store a theme value
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key || key === this.STORAGE_KEY) continue;
                const val = localStorage.getItem(key);
                if (val === 'dark' || val === 'light') {
                    localStorage.setItem(this.STORAGE_KEY, val);
                    break;
                }
            }
        }

        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

        if (isDarkMode) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    },

    setupToggle() {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    initMobileNav() {
        const header = document.querySelector('.header');
        const headerContent = document.querySelector('.header-content');
        const nav = document.querySelector('.nav');
        const themeToggle = document.querySelector('.theme-toggle');

        if (!header || !headerContent || !nav || document.querySelector('.nav-toggle')) return;

        const headerActions = document.createElement('div');
        headerActions.className = 'header-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Open navigation');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<span></span><span></span><span></span>';

        headerActions.appendChild(toggleBtn);

        if (themeToggle) {
            headerActions.appendChild(themeToggle);
        }

        if (headerContent.contains(themeToggle)) {
            headerContent.insertBefore(headerActions, themeToggle.nextSibling);
        } else {
            headerContent.appendChild(headerActions);
        }

        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);

        const panel = document.createElement('nav');
        panel.className = 'mobile-nav-panel';
        panel.setAttribute('aria-label', 'Mobile navigation');

        const list = document.createElement('ul');
        list.className = 'mobile-nav-list';

        const sourceLinks = nav.querySelectorAll('.nav-link');
        sourceLinks.forEach(link => {
            const listItem = document.createElement('li');
            listItem.className = 'mobile-nav-link';
            const linkClone = link.cloneNode(true);
            linkClone.classList.add('mobile-nav-link-anchor');
            listItem.appendChild(linkClone);
            list.appendChild(listItem);
        });

        panel.appendChild(list);
        document.body.appendChild(panel);

        toggleBtn.addEventListener('click', () => this.toggleMobileNav(toggleBtn, overlay, panel));
        overlay.addEventListener('click', () => this.closeMobileNav(toggleBtn, overlay, panel));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeMobileNav(toggleBtn, overlay, panel);
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileNav(toggleBtn, overlay, panel);
            }
        });
    },

    toggleMobileNav(toggleBtn, overlay, panel) {
        const isOpen = panel.classList.contains('is-open');
        panel.classList.toggle('is-open', !isOpen);
        overlay.classList.toggle('is-visible', !isOpen);
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
        document.body.style.overflow = !isOpen ? 'hidden' : '';
    },

    closeMobileNav(toggleBtn, overlay, panel) {
        panel.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        toggleBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    },

    handleScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        const onScroll = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 16);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    },

    initToolSearch() {
        const searchInput = document.getElementById('toolSearch') || document.querySelector('.search-input');
        const toolsGrid = document.querySelector('.tools-grid');
        const emptyState = document.querySelector('.tools-empty-state');
        const meta = document.querySelector('.search-meta');

        if (!searchInput || !toolsGrid) return;

        const cards = Array.from(toolsGrid.querySelectorAll('.tool-card'));

        // Store original text for safe highlighting
        cards.forEach(card => {
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('p');
            if (titleEl && !titleEl.dataset.original) titleEl.dataset.original = titleEl.textContent.trim();
            if (descEl && !descEl.dataset.original) descEl.dataset.original = descEl.textContent.trim();
        });

        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const clearHighlights = (card) => {
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('p');
            if (titleEl && titleEl.dataset.original) titleEl.innerHTML = titleEl.dataset.original;
            if (descEl && descEl.dataset.original) descEl.innerHTML = descEl.dataset.original;
        };

        const applyHighlights = (card, query) => {
            if (!query) return clearHighlights(card);
            const q = escapeRegExp(query);
            const re = new RegExp(`(${q})`, 'ig');
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('p');
            if (titleEl && titleEl.dataset.original) {
                titleEl.innerHTML = titleEl.dataset.original.replace(re, '<mark class="match-mark">$1</mark>');
            }
            if (descEl && descEl.dataset.original) {
                descEl.innerHTML = descEl.dataset.original.replace(re, '<mark class="match-mark">$1</mark>');
            }
        };

        const buildSearchText = (card) => {
            const title = card.querySelector('h3')?.dataset?.original || card.querySelector('h3')?.textContent || '';
            const description = card.querySelector('p')?.dataset?.original || card.querySelector('p')?.textContent || '';
            // include data-keywords attribute if present
            const kws = card.getAttribute('data-keywords') || '';
            return `${title} ${description} ${kws}`.toLowerCase();
        };

        const searchEntries = cards.map((card) => ({
            card,
            searchText: buildSearchText(card)
        }));

        // Debounce utility
        let debounceTimer = null;
        const debounce = (fn, wait = 150) => {
            return (...args) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => fn(...args), wait);
            };
        };

        const updateVisibility = (rawQuery) => {
            const query = (rawQuery || '').trim().toLowerCase();
            let visibleCount = 0;

            searchEntries.forEach(({ card, searchText }) => {
                const matches = !query || searchText.includes(query);
                card.classList.toggle('is-hidden', !matches);
                if (matches) {
                    visibleCount += 1;
                    applyHighlights(card, query);
                } else {
                    clearHighlights(card);
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }

            if (meta) {
                const total = cards.length;
                if (!query) {
                    meta.textContent = '';
                } else if (visibleCount === 0) {
                    meta.textContent = 'No tools found.';
                } else {
                    meta.textContent = `Showing ${visibleCount} of ${total} tools`;
                }
            }
        };

        const debouncedUpdate = debounce((e) => updateVisibility(e.target.value), 120);

        const clearBtn = document.querySelector('.search-clear');
        const toggleClearVisibility = (val) => {
            if (!clearBtn) return;
            const show = val && val.trim().length > 0;
            clearBtn.hidden = !show;
        };

        searchInput.addEventListener('input', (e) => {
            toggleClearVisibility(e.target.value);
            debouncedUpdate(e);
        });
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                searchInput.value = '';
                updateVisibility('');
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                searchInput.value = '';
                toggleClearVisibility('');
                updateVisibility('');
                searchInput.focus();
            });
        }

        // initialize
        updateVisibility('');
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.contains(this.DARK_MODE_CLASS);
        if (isDark) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
    },

    enableDarkMode() {
        document.documentElement.classList.add(this.DARK_MODE_CLASS);
        localStorage.setItem(this.STORAGE_KEY, 'dark');
        this.updateToggleIcon(true);
    },

    enableLightMode() {
        document.documentElement.classList.remove(this.DARK_MODE_CLASS);
        localStorage.setItem(this.STORAGE_KEY, 'light');
        this.updateToggleIcon(false);
    },

    updateToggleIcon(isDark) {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;

        if (isDark) {
            // Moon icon (for dark mode - shows moon)
            toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.293 13.293A8 8 0 1 1 6.707 2.707a5.5 5.5 0 1 0 10.586 10.586Z" fill="currentColor"/>
                </svg>
            `;
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            // Sun icon (for light mode - shows sun)
            toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="4" fill="currentColor"/>
                    <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="18" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="4" y1="10" x2="2" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="15.6" y1="4.4" x2="14.2" y2="5.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="5.8" y1="14.2" x2="4.4" y2="15.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="15.6" y1="15.6" x2="14.2" y2="14.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="5.8" y1="5.8" x2="4.4" y2="4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
};

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}
