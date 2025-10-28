/**
 * SCROLL ANIMATIONS - Unified and clean page reveal effects
 * 
 * This module handles scroll-triggered animations with a single, consistent
 * fade-up animation for all elements. No complex alternating or multiple effects.
 */

class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        // Find all elements that should be animated
        this.findAnimatableElements();
        
        // Set up intersection observer
        this.createObserver();
        
        // Start observing elements
        this.startObserving();
        
        // Special handling for hero section
        this.animateHeroSection();
        
        console.log(`ScrollAnimations: Initialized with ${this.animatedElements.length} elements`);
    }

    findAnimatableElements() {
        // Define selectors for elements that should animate
        const animatableSelectors = [
            // Text content
            '.about-trusted__text',
            '.about-designed__column p',
            '.about-mission__text p',
            '.about-service__description',
            '.page-content p',
            
            // Section titles
            '.about-trusted__title',
            '.about-designed__title',
            '.about-mission__title',
            '.about-services__title',
            
            // Service cards
            '.about-service',
            
            // Images
            '.about-trusted__image',
            '.about-designed__image-item',
            '.about-mission__image',
            '.about-service__image',
            
            // Columns
            '.about-designed__column'
        ];

        // Add unified animation classes to all elements
        animatableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                // Everyone gets the same basic fade-up animation
                el.classList.add('fade-up');
                
                // Add subtle stagger delay for elements in groups
                if (index < 6) {
                    el.classList.add(`stagger-${index + 1}`);
                }
                
                this.animatedElements.push(el);
            });
        });

        // Special handling for service card elements with consistent delays
        document.querySelectorAll('.about-service__title').forEach((el, index) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${0.1 + (index * 0.1)}s`;
            this.animatedElements.push(el);
        });

        document.querySelectorAll('.about-service__button').forEach((el, index) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${0.2 + (index * 0.1)}s`;
            this.animatedElements.push(el);
        });

        // Add section title animation class
        document.querySelectorAll('.about-trusted__title, .about-designed__title, .about-mission__title, .about-services__title').forEach(el => {
            el.classList.remove('fade-up'); // Remove if already added
            el.classList.add('section-title-animate');
        });

        // Add image animation class
        document.querySelectorAll('.about-trusted__image, .about-designed__image-item, .about-mission__image, .about-service__image').forEach(el => {
            el.classList.remove('fade-up'); // Remove if already added
            el.classList.add('image-animate');
        });
    }

    createObserver() {
        const options = {
            root: null, // Use viewport as root
            rootMargin: '-10% 0px -10% 0px', // Trigger when element is 10% visible
            threshold: 0.1 // Trigger when 10% of element is visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    // Stop observing this element once animated
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    startObserving() {
        this.animatedElements.forEach(element => {
            this.observer.observe(element);
        });
    }

    // Simple, clean animation trigger
    animateElement(element) {
        // Add a small delay to make the animation feel more natural
        setTimeout(() => {
            element.classList.add('animate-in');
            
            // Clean up performance properties after animation
            this.cleanupAnimation(element);
        }, 50);
    }

    // Performance optimization: Clean up will-change after animations complete
    cleanupAnimation(element) {
        setTimeout(() => {
            element.classList.add('animation-complete');
            element.style.willChange = 'auto';
        }, 1000); // Wait for animation to complete
    }

    animateHeroSection() {
        // Hero section should animate immediately when page loads
        const heroTitle = document.querySelector('.about-hero__title');
        const heroSubtitle = document.querySelector('.about-hero__subtitle');
        
        if (heroTitle || heroSubtitle) {
            // Small delay to let page settle
            setTimeout(() => {
                if (heroTitle) {
                    heroTitle.classList.add('animate-in');
                }
                if (heroSubtitle) {
                    heroSubtitle.classList.add('animate-in');
                }
            }, 200);
        }
    }

    // Public method to manually trigger animation on an element
    triggerAnimation(element) {
        if (element && !element.classList.contains('animate-in')) {
            this.animateElement(element);
        }
    }

    // Public method to add new elements for animation
    addElement(element, animationType = 'fade-up') {
        element.classList.add(animationType);
        this.animatedElements.push(element);
        this.observer.observe(element);
    }

    // Debug method to show all animated elements
    debugAnimatedElements() {
        console.log('ScrollAnimations Debug:', {
            totalElements: this.animatedElements.length,
            elements: this.animatedElements
        });
    }
}

// Initialize scroll animations when the module loads
let scrollAnimations;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    scrollAnimations = new ScrollAnimations();
});

// Export for use in other modules
export { ScrollAnimations };
