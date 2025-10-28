/**
 * WE SERVE SECTION - Scroll-driven text cycling with section locking
 * 
 * This module handles:
 * - Scroll-driven text cycling (no automatic timing)
 * - True section locking until all words are cycled
 * - Smooth scroll-to-next behavior after completion
 */

class WeServeSection {
    constructor() {
        this.section = null;
        this.dynamicContainer = null;
        this.words = [
            'PRO TOURS',
            'CLUBS', 
            'ACADEMIES',
            'CORPORATE',
            'MIDDLE SCHOOLS',
            'HIGH SCHOOLS',
            'D1 COLLEGES'
        ];
        this.currentWordIndex = 0;
        this.wordElements = [];
        this.isAnimating = false;
        this.scrollCount = 0;
        this.isLocked = false;
        this.hasCompletedCycle = false;
        this.lastScrollTime = 0;
        this.scrollThreshold = 300; // Minimum time between scroll events
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSection());
        } else {
            this.setupSection();
        }
    }

    setupSection() {
        this.findElements();
        if (!this.section) return;
        
        this.createWordElements();
        this.setupIntersectionObserver();
        this.setupScrollLocking();
        this.bindEvents();
        
    }

    findElements() {
        this.section = document.querySelector('.we-serve-section');
        this.dynamicContainer = document.querySelector('.we-serve-section__dynamic');
    }

    createWordElements() {
        if (!this.dynamicContainer) {
            return;
        }
        
        // Clear existing content
        this.dynamicContainer.innerHTML = '';
        this.wordElements = [];
        
        // Create word elements
        this.words.forEach((word, index) => {
            const wordElement = document.createElement('span');
            wordElement.className = 'we-serve-section__word';
            wordElement.textContent = word;
            
            // First word starts as active
            if (index === 0) {
                wordElement.classList.add('active');
            }
            
            this.dynamicContainer.appendChild(wordElement);
            this.wordElements.push(wordElement);
        });
        
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.8 // Section must be 80% visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.onEnterSection();
                } else {
                    this.onExitSection();
                }
            });
        }, options);

        if (this.section) {
            this.observer.observe(this.section);
        }
    }

    onEnterSection() {
        this.isLocked = true;
        this.scrollCount = 0;
        this.hasCompletedCycle = false;
        this.currentWordIndex = 0;
        
        // Reset to first word
        this.showWord(0);
        
        // Animate in the static text
        setTimeout(() => {
            const staticText = document.querySelector('.we-serve-section__static');
            if (staticText) staticText.classList.add('animate-in');
        }, 200);
        
        setTimeout(() => {
            const dynamicContainer = document.querySelector('.we-serve-section__dynamic');
            if (dynamicContainer) dynamicContainer.classList.add('animate-in');
        }, 600);
        
        this.updateScrollIndicator();
    }

    onExitSection() {
        this.isLocked = false;
        this.scrollCount = 0;
        this.hasCompletedCycle = false;
        
        // Reset animation states
        const staticText = document.querySelector('.we-serve-section__static');
        const dynamicContainer = document.querySelector('.we-serve-section__dynamic');
        
        if (staticText) staticText.classList.remove('animate-in');
        if (dynamicContainer) dynamicContainer.classList.remove('animate-in');
    }

    setupScrollLocking() {
        // Primary scroll lock mechanism
        const handleScroll = (event) => {
            const now = Date.now();
            
            // Throttle scroll events to prevent overwhelming
            if (now - this.lastScrollTime < this.scrollThreshold) {
                if (this.isLocked && !this.hasCompletedCycle) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                return;
            }
            this.lastScrollTime = now;
            
            // Only handle if section is locked and visible
            if (!this.isLocked || !this.isInViewport()) return;
            
            const isScrollingDown = event.deltaY > 0;
            
            if (isScrollingDown) {
                if (!this.hasCompletedCycle) {
                    // Prevent scroll and advance to next word
                    event.preventDefault();
                    event.stopPropagation();
                    
                    this.advanceWord();
                } else {
                    // Allow scroll to continue to next section
                    this.isLocked = false;
                    this.transitionToNextSection();
                }
            }
        };

        // Use passive: false to allow preventDefault
        document.addEventListener('wheel', handleScroll, { passive: false });
        
        // Enhanced touch handling
        this.setupTouchScrollLocking();
        
        // Keyboard handling
        this.setupKeyboardScrollLocking();
    }

    setupTouchScrollLocking() {
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (!this.isLocked || !this.isInViewport()) return;
            
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isLocked || !this.isInViewport()) return;
            
            // Prevent scrolling if cycle not complete
            if (!this.hasCompletedCycle) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (!this.isLocked || !this.isInViewport()) return;
            
            touchEndY = e.changedTouches[0].clientY;
            const swipeDistance = touchStartY - touchEndY;
            const swipeTime = Date.now() - touchStartTime;
            
            // Detect upward swipe (scrolling down)
            if (swipeDistance > 50 && swipeTime < 500) {
                if (!this.hasCompletedCycle) {
                    this.advanceWord();
                } else {
                    this.isLocked = false;
                    this.transitionToNextSection();
                }
            }
        }, { passive: true });
    }

    setupKeyboardScrollLocking() {
        document.addEventListener('keydown', (e) => {
            if (!this.isLocked || !this.isInViewport()) return;
            
            // Handle scroll-like keys
            if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
                if (!this.hasCompletedCycle) {
                    e.preventDefault();
                    this.advanceWord();
                } else {
                    this.transitionToNextSection();
                }
            }
            
            // Skip section entirely with Escape
            if (e.code === 'Escape') {
                e.preventDefault();
                this.skipToNextSection();
            }
        });
    }

    advanceWord() {
        if (this.isAnimating) return;
        
        // Calculate next word index
        const nextIndex = (this.currentWordIndex + 1) % this.words.length;
        
        // Check if we've completed a full cycle
        if (nextIndex === 0 && this.currentWordIndex === this.words.length - 1) {
            this.hasCompletedCycle = true;
        }
        
        this.showWord(nextIndex);
        this.currentWordIndex = nextIndex;
        this.scrollCount++;
        
        this.updateScrollIndicator();
        
        // Visual feedback
        this.addScrollFeedback();
    }

    showWord(index) {
        if (this.isAnimating || !this.wordElements[index]) return;
        
        this.isAnimating = true;
        
        // Hide all words
        this.wordElements.forEach((word, i) => {
            if (i !== index) {
                word.classList.remove('active');
            }
        });
        
        // Show target word after brief delay
        setTimeout(() => {
            if (this.wordElements[index]) {
                this.wordElements[index].classList.add('active');
            }
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 200);
        }, 100);
    }

    updateScrollIndicator() {
        const indicator = document.querySelector('.we-serve-section__scroll-indicator');
        if (!indicator) return;
        
        if (this.hasCompletedCycle) {
            indicator.textContent = 'Scroll to continue';
            indicator.style.opacity = '0.8';
        } else {
            const remaining = this.words.length - (this.currentWordIndex + 1);
            indicator.textContent = remaining > 0 ? `${remaining} more to unlock` : 'Unlocked! Scroll to continue';
            indicator.style.opacity = '1';
        }
        
        // Update progress bar
        const progress = ((this.currentWordIndex + 1) / this.words.length) * 100;
        this.dynamicContainer.style.setProperty('--progress', `${progress}%`);
    }

    addScrollFeedback() {
        // Subtle visual feedback when word changes
        const container = document.querySelector('.we-serve-section__container');
        if (container) {
            container.style.transform = 'scale(1.02)';
            setTimeout(() => {
                container.style.transform = 'scale(1)';
            }, 150);
        }
    }

    transitionToNextSection() {
        this.section.classList.add('transitioning-out');
        
        // Allow natural scroll after brief delay
        setTimeout(() => {
            const nextSection = this.section.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 300);
        
        // Clean up
        setTimeout(() => {
            this.section.classList.remove('transitioning-out');
        }, 1000);
    }

    skipToNextSection() {
        this.hasCompletedCycle = true;
        this.isLocked = false;
        this.transitionToNextSection();
    }

    isInViewport() {
        if (!this.section) return false;
        
        const rect = this.section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Section is considered active if more than 60% visible
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visibilityRatio = visibleHeight / windowHeight;
        
        return visibilityRatio > 0.6;
    }

    bindEvents() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause any animations when tab is not visible
                this.isAnimating = false;
            }
        });
    }

    handleResize() {
        // Recalculate viewport detection for mobile
        if (window.innerWidth <= 768) {
            this.scrollThreshold = 200; // Faster response on mobile
        } else {
            this.scrollThreshold = 300;
        }
    }

    // Public methods for debugging
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.isLocked = false;
    }

    // Manual controls for testing
    nextWord() {
        if (!this.isAnimating) {
            this.advanceWord();
        }
    }

    resetSection() {
        this.currentWordIndex = 0;
        this.scrollCount = 0;
        this.hasCompletedCycle = false;
        this.showWord(0);
        this.updateScrollIndicator();
    }

    scrollToNextSection() {
        const nextSection = this.section.nextElementSibling;
        if (nextSection) {
            nextSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Enhanced text effects for premium feel
class WeServeTextEffects {
    static addGlitchEffect(element, duration = 200) {
        element.style.animation = `textGlitch ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
    
    static addShakeEffect(element, intensity = 2) {
        const originalTransform = element.style.transform;
        
        element.style.animation = `shake ${intensity}s ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
            element.style.transform = originalTransform;
        }, intensity * 1000);
    }
}

// Auto-initialize
let weServeSection;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if the section exists
    if (document.querySelector('.we-serve-section')) {
        weServeSection = new WeServeSection();
        
        // Make available globally for debugging
        window.weServeSection = weServeSection;
        window.WeServeTextEffects = WeServeTextEffects;
    }
});

// Export for use in other modules
export { WeServeSection, WeServeTextEffects };
