/**
 * Dual Panel Scroll Behavior
 * Mimics Yeti's product page scroll experience:
 * - Dual-panel container is fixed until left panel content is exhausted
 * - Left panel scrolls independently 
 * - Right panel stays in view
 * - When left panel reaches bottom, entire page becomes scrollable
 */

export default class DualPanelScroll {
    constructor() {
        this.container = document.querySelector('.dual-panel-container');
        this.mediaPanel = document.getElementById('mediaPanel');
        this.detailsPanel = document.getElementById('detailsPanel');
        
        if (!this.container || !this.mediaPanel || !this.detailsPanel) {
            return;
        }

        this.isDesktop = window.matchMedia('(min-width: 1025px)').matches;
        this.mediaPanelScrolled = false;
        
        this.init();
    }

    init() {
        if (!this.isDesktop) {
            this.enableNormalScrolling();
            return;
        }

        // Initially prevent page scroll
        document.body.style.overflow = 'hidden';
        
        // Listen for media panel scroll
        this.mediaPanel.addEventListener('scroll', this.handleMediaScroll.bind(this));
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleMediaScroll() {
        const { scrollTop, scrollHeight, clientHeight } = this.mediaPanel;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        
        if (isAtBottom && !this.mediaPanelScrolled) {
            this.mediaPanelScrolled = true;
            this.enablePageScroll();
        } else if (!isAtBottom && this.mediaPanelScrolled && window.scrollY === 0) {
            this.mediaPanelScrolled = false;
            this.disablePageScroll();
        }
    }

    enablePageScroll() {
        document.body.style.overflow = 'auto';
        this.container.style.position = 'relative';
        
        // Listen for page scroll to detect return to top
        window.addEventListener('scroll', this.handlePageScroll.bind(this));
    }

    disablePageScroll() {
        document.body.style.overflow = 'hidden';
        this.container.style.position = 'fixed';
        
        window.removeEventListener('scroll', this.handlePageScroll);
    }

    handlePageScroll() {
        if (window.scrollY === 0 && this.mediaPanelScrolled) {
            // User scrolled back to top - reset media panel scroll state
            this.mediaPanel.scrollTop = this.mediaPanel.scrollHeight;
        }
    }

    enableNormalScrolling() {
        document.body.style.overflow = 'auto';
        if (this.container) {
            this.container.style.position = 'relative';
            this.container.style.height = 'auto';
        }
    }

    handleResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.matchMedia('(min-width: 1025px)').matches;
        
        if (wasDesktop !== this.isDesktop) {
            this.cleanup();
            this.init();
        }
    }

    cleanup() {
        window.removeEventListener('scroll', this.handlePageScroll);
        document.body.style.overflow = 'auto';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DualPanelScroll();
});
