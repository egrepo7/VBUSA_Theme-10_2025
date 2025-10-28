/**
 * Natural Dual Panel Behavior
 * - Uses CSS sticky positioning for natural flow
 * - Right panel sticks until its content ends
 * - Page flows naturally: header -> dual-panel -> related products -> footer
 * - No artificial "unlocking" or complex scroll management
 */

export default class NaturalDualPanel {
    constructor() {
        this.container = document.querySelector('.dual-panel-container');
        this.detailsPanel = document.querySelector('.details-panel');
        
        if (!this.container || !this.detailsPanel) {
            return;
        }

        this.isDesktop = window.matchMedia('(min-width: 1025px)').matches;
        this.init();
    }

    init() {
        if (!this.isDesktop) {
            this.enableMobileLayout();
            return;
        }

        // Enable natural scrolling - no artificial scroll blocking
        document.body.style.overflow = 'auto';
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Ensure proper sticky behavior
        this.setupStickyBehavior();
        
        // Setup quantity selector functions
        this.setupQuantitySelector();
    }

    setupStickyBehavior() {
        // Ensure the sticky positioning works correctly
        // by making sure the parent has proper height
        if (this.container) {
            this.container.style.position = 'relative';
        }
    }

    setupQuantitySelector() {
        // The theme's native quantity selector uses data-quantity-change
        // and is handled by the product-details.js listenQuantityChange() method
        // We just need to ensure it works properly in our split layout
        
        const quantityContainer = document.querySelector('[data-quantity-change]');
        if (quantityContainer) {
            // Ensure the native theme functionality is properly initialized
            // The theme handles this automatically through product-details.js
        }
    }

    enableMobileLayout() {
        // For mobile - ensure normal document flow
        document.body.style.overflow = 'auto';
        
        if (this.container) {
            this.container.style.position = 'relative';
        }
        
        if (this.detailsPanel) {
            this.detailsPanel.style.position = 'relative';
            this.detailsPanel.style.top = 'auto';
        }
    }

    handleResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.matchMedia('(min-width: 1025px)').matches;
        
        if (wasDesktop !== this.isDesktop) {
            this.init();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NaturalDualPanel();
});
