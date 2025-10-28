/**
 * Lenis Smooth Scroll Implementation for VBUSA Theme
 * Implements smooth scrolling with performance and accessibility considerations
 */

import Lenis from '@studio-freight/lenis';

class SmoothScrollManager {
    constructor() {
        this.lenis = null;
        this.isEnabled = false;
        this.init();
    }

    init() {
        // Check if smooth scroll should be enabled
        if (!this.shouldEnableSmootScroll()) {
            console.log('Smooth scroll disabled due to user preferences or device limitations');
            return;
        }

        this.initLenis();
        this.bindEvents();
    }

    shouldEnableSmootScroll() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return false;
        }

        // Disable on mobile for better native scroll experience
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            return false;
        }

        // Disable on low-end devices
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection && connection.effectiveType === 'slow-2g') {
            return false;
        }

        return true;
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false, // Disable on touch devices
            touchMultiplier: 2,
            infinite: false,
        });

        this.isEnabled = true;
        this.startRaf();

        // Add class to body for styling adjustments
        document.body.classList.add('smooth-scroll-enabled');
    }

    startRaf() {
        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    bindEvents() {
        // Handle scroll-to-section buttons (like in your volleyball nets template)
        document.addEventListener('click', (e) => {
            const scrollButton = e.target.closest('.scroll-to-section');
            if (scrollButton) {
                e.preventDefault();
                const target = scrollButton.getAttribute('href');
                if (target && target.startsWith('#')) {
                    this.scrollToElement(target);
                }
            }
        });

        // Handle category hero scroll arrow
        document.addEventListener('click', (e) => {
            const scrollArrow = e.target.closest('.category-hero__scroll-btn');
            if (scrollArrow) {
                e.preventDefault();
                this.scrollToNextSection();
            }
        });

        // Pause smooth scroll during BigCommerce modal/drawer operations
        document.addEventListener('modal:open', () => this.pause());
        document.addEventListener('modal:close', () => this.resume());
        
        // Handle cart drawer
        document.addEventListener('cart:open', () => this.pause());
        document.addEventListener('cart:close', () => this.resume());
    }

    scrollToElement(selector) {
        if (!this.isEnabled) return;
        
        const element = document.querySelector(selector);
        if (element) {
            this.lenis.scrollTo(element, {
                offset: -100, // Account for sticky header
                duration: 1.5
            });
        }
    }

    scrollToNextSection() {
        if (!this.isEnabled) return;
        
        // For volleyball nets page, scroll to outdoor nets section
        const nextSection = document.querySelector('#outdoor-nets-section') || 
                           document.querySelector('.category-showcase');
        
        if (nextSection) {
            this.lenis.scrollTo(nextSection, {
                offset: -50,
                duration: 1.8
            });
        }
    }

    pause() {
        if (this.lenis) {
            this.lenis.stop();
        }
    }

    resume() {
        if (this.lenis) {
            this.lenis.start();
        }
    }

    destroy() {
        if (this.lenis) {
            this.lenis.destroy();
            this.lenis = null;
            this.isEnabled = false;
            document.body.classList.remove('smooth-scroll-enabled');
        }
    }
}

// Initialize only on specific pages where smooth scroll adds value
const initSmoothScroll = () => {
    // Only enable on specific pages
    const enabledPages = [
        'volleyball-nets',
        'category',
        'home'
    ];

    const currentPage = document.body.getAttribute('data-page-type') || 
                       window.location.pathname;

    const shouldInit = enabledPages.some(page => 
        currentPage.includes(page) || document.body.classList.contains(`page--${page}`)
    );

    if (shouldInit) {
        new SmoothScrollManager();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
    initSmoothScroll();
}

export default SmoothScrollManager;
