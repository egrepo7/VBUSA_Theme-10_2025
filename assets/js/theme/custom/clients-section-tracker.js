/**
 * Clients Section Tracker
 * 
 * This module tracks when the user is in the clients section
 * and adds/removes body classes accordingly to control header visibility
 */

class ClientsSectionTracker {
    constructor() {
        this.section = null;
        this.observer = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTracker());
        } else {
            this.setupTracker();
        }
    }

    setupTracker() {
        this.section = document.querySelector('.clients-partners');
        if (!this.section) {
            console.log('ClientsSectionTracker: Clients section not found');
            return;
        }
        
        this.setupIntersectionObserver();
        console.log('ClientsSectionTracker: Initialized');
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px 0px 0px',
            threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] // Multiple thresholds for fine control
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const visibilityRatio = entry.intersectionRatio;
                
                // Consider section "active" if it occupies more than 30% of viewport
                if (visibilityRatio > 0.3 && !this.isActive) {
                    this.enterSection();
                } else if (visibilityRatio <= 0.3 && this.isActive) {
                    this.exitSection();
                }
            });
        }, options);

        this.observer.observe(this.section);
    }

    enterSection() {
        console.log('ClientsSectionTracker: Entering clients section - hiding header');
        this.isActive = true;
        document.body.classList.add('clients-active');
    }

    exitSection() {
        console.log('ClientsSectionTracker: Exiting clients section - allowing header to show');
        this.isActive = false;
        document.body.classList.remove('clients-active');
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        document.body.classList.remove('clients-active');
    }
}

export default ClientsSectionTracker;
