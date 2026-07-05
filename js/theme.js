// Theme Management System
const ThemeManager = {
    STORAGE_KEY: 'tooligo-theme',
    DARK_MODE_CLASS: 'dark-mode',

    init() {
        this.restoreTheme();
        this.setupToggle();
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
