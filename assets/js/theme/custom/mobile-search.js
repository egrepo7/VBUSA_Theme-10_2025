/**
 * Mobile Search Toggle Functionality
 * Handles the mobile search dropdown for tablet and mobile devices
 */

export default class MobileSearch {
    constructor() {
        this.mobileSearchToggle = document.getElementById('mobile-search-toggle');
        this.mobileSearchDropdown = document.getElementById('mobile-search-dropdown');
        this.searchInput = this.mobileSearchDropdown?.querySelector('input[type="search"], input[name*="search"]');
        this.isOpen = false;
        
        this.bindEvents();
    }

    bindEvents() {
        if (!this.mobileSearchToggle || !this.mobileSearchDropdown) {
            return;
        }

        // Toggle mobile search dropdown
        this.mobileSearchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSearch();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.mobileSearchDropdown.contains(e.target) && 
                !this.mobileSearchToggle.contains(e.target)) {
                this.closeSearch();
            }
        });

        // Prevent dropdown from closing when clicking inside
        this.mobileSearchDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Focus search input when dropdown opens
        this.mobileSearchDropdown.addEventListener('transitionend', () => {
            if (this.isOpen && this.searchInput) {
                this.searchInput.focus();
            }
        });
    }

    toggleSearch() {
        if (this.isOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }

    openSearch() {
        this.isOpen = true;
        this.mobileSearchDropdown.setAttribute('aria-hidden', 'false');
        this.mobileSearchToggle.setAttribute('aria-expanded', 'true');
        
        // Add body class to prevent scroll if needed
        document.body.classList.add('mobile-search-open');
        
        // Improve placeholder text
        if (this.searchInput) {
            this.searchInput.setAttribute('placeholder', 'Search');
        }
        
        // Focus the search input after animation with smooth scroll prevention
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.focus();
                // Scroll to top to ensure search is visible
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 300);
    }

    closeSearch() {
        this.isOpen = false;
        this.mobileSearchDropdown.setAttribute('aria-hidden', 'true');
        this.mobileSearchToggle.setAttribute('aria-expanded', 'false');
        
        // Remove body class
        document.body.classList.remove('mobile-search-open');
        
        // Clear search input if desired
        if (this.searchInput) {
            this.searchInput.blur();
        }
    }

    // Method to programmatically close search (useful for other scripts)
    close() {
        this.closeSearch();
    }

    // Method to check if search is open
    get isSearchOpen() {
        return this.isOpen;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileSearch();
    });
} else {
    new MobileSearch();
}
