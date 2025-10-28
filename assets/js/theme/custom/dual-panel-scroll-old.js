/**
 * Dual Panel Scroll Synchronization
 * 
 * Simple behavior:
 * 1. Left panel (media) scrolls independently
 * 2. Right panel (details) stays in view
 * 3. When left panel reaches bottom, entire dual-panel scrolls to reveal footer
 */

export default class DualPanelScroll {
    constructor() {
        this.mediaPanel = document.getElementById('mediaPanel');
        this.detailsPanel = document.getElementById('detailsPanel');
        this.container = document.querySelector('.dual-panel-container');
        
        if (!this.mediaPanel || !this.detailsPanel || !this.container) {
            return;
        }

        this.init();
    }

    init() {
        // Check if we're on mobile (responsive breakpoint)
        this.isMobile = window.matchMedia('(max-width: 1024px)').matches;
        
        if (this.isMobile) {
            // On mobile, use normal scrolling
            this.enableNormalScrolling();
            return;
        }
        
        // Monitor media panel scroll to detect when it reaches bottom
        this.mediaPanel.addEventListener('scroll', this.checkMediaScroll.bind(this));
        
        // Handle window resize to toggle mobile mode
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Prevent page scroll initially
        document.body.style.overflow = 'hidden';
    }

    checkMediaScroll() {
        if (this.isMobile) return;
        
        const atBottom = this.isAtBottom(this.mediaPanel);
        
        if (atBottom && !this.container.classList.contains('allow-page-scroll')) {
            // Left panel reached bottom - enable page scroll
            this.enablePageScroll();
        }
    }

    isAtBottom(element) {
        const threshold = 10; // Small threshold for better detection
        return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
    }

    enablePageScroll() {
        // Allow page to scroll naturally
        this.container.classList.add('allow-page-scroll');
        document.body.style.overflow = 'auto';
        
        // Listen for scroll to potentially return to fixed mode
        window.addEventListener('scroll', this.handlePageScroll.bind(this), { passive: true });
    }

    handlePageScroll() {
        // If user scrolls back to top, return to fixed positioning
        if (window.scrollY <= 10) {
            this.disablePageScroll();
        }
    }

    disablePageScroll() {
        // Return to fixed positioning
        this.container.classList.remove('allow-page-scroll');
        document.body.style.overflow = 'hidden';
        
        // Remove page scroll listener
        window.removeEventListener('scroll', this.handlePageScroll);
    }

    enableNormalScrolling() {
        // For mobile - normal document flow
        document.body.style.overflow = 'auto';
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.matchMedia('(max-width: 1024px)').matches;
        
        // If switching to/from mobile, reset states
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.enableNormalScrolling();
            } else {
                this.init();
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dualPanelScroll = new DualPanelScroll();
    
    // Expose to global scope for debugging
    window.dualPanelScroll = dualPanelScroll;
});
