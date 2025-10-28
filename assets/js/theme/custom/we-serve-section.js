/**
 * WE SERVE SECTION - Automatic text cycling
 * 
 * Behavior:
 * - Full viewport section with automatic text cycling
 * - No scroll lock - users can scroll freely
 * - Text cycles automatically and endlessly
 * - Clean, simple implementation
 */

class WeServeSection {
    constructor() {
        console.log('WeServeSection: Constructor called');
        this.section = null;
        this.dynamicContainer = null;
        this.staticElement = null;
        this.words = [
            'HOMEOWNERS',
            'PRO TOURS',
            'D1 COLLEGES',
            'D2 COLLEGES',
            'D3 COLLEGES',
            'SPORTS COMPLEXES',
            'ACADEMIES',
            'CLUBS',
            'HIGH SCHOOLS',
            'MIDDLE SCHOOLS',
            'ELEMENTARY',
            'CORPORATE'
        ];
        this.currentWordIndex = 0;
        this.wordElements = [];
        this.cyclingInterval = null;
        this.cyclingSpeed = 750; // Fast cycling - 0.25 seconds (250ms) between words
        this.isVisible = false;
        
        // Initialize immediately
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
        if (!this.section) {
            console.log('WeServeSection: Section element not found!');
            return;
        }
        
        console.log('WeServeSection: Found section element');
        this.createWordElements();
        this.setupIntersectionObserver();
        this.animateStaticText();
        
        console.log('WeServeSection: Initialized');
    }

    findElements() {
        this.section = document.querySelector('.we-serve-section');
        this.dynamicContainer = document.querySelector('.we-serve-section__dynamic');
        this.staticElement = document.querySelector('.we-serve-section__static');
        
        console.log('WeServeSection: Section found:', !!this.section);
        console.log('WeServeSection: Dynamic container found:', !!this.dynamicContainer);
        console.log('WeServeSection: Static element found:', !!this.staticElement);
    }

    createWordElements() {
        if (!this.dynamicContainer) {
            console.log('WeServeSection: Dynamic container not found');
            return;
        }

        // Clear existing content
        this.dynamicContainer.innerHTML = '';
        this.wordElements = [];

        // Create word elements
        this.words.forEach((word, index) => {
            const wordElement = document.createElement('span');
            wordElement.className = 'we-serve-section__word'; // Fixed class name to match SCSS
            wordElement.textContent = word;
            
            // Only show first word initially
            if (index === 0) {
                wordElement.classList.add('active');
            }
            
            this.dynamicContainer.appendChild(wordElement);
            this.wordElements.push(wordElement);
        });

        console.log('WeServeSection: Created', this.wordElements.length, 'word elements');
    }

    setupIntersectionObserver() {
        // Simple observer to detect when section is visible
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Section is considered visible when 50% is in viewport
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isVisible) {
                    console.log('WeServeSection: Section is visible - starting cycling');
                    this.startCycling();
                    this.isVisible = true;
                } else if (!entry.isIntersecting && this.isVisible) {
                    console.log('WeServeSection: Section is not visible - stopping cycling');
                    this.stopCycling();
                    this.isVisible = false;
                }
            });
        }, options);

        if (this.section) {
            this.observer.observe(this.section);
        }
    }

    animateStaticText() {
        // Animate the static "WE SERVE" text
        if (this.staticElement) {
            setTimeout(() => {
                this.staticElement.classList.add('animate-in');
            }, 500); // Delay for effect
        }
    }

    startCycling() {
        // Stop any existing cycling
        this.stopCycling();
        
        // Make the dynamic container visible
        if (this.dynamicContainer) {
            this.dynamicContainer.classList.add('animate-in');
        }
        
        // Start automatic cycling
        this.cyclingInterval = setInterval(() => {
            this.nextWord();
        }, this.cyclingSpeed);
        
        console.log('WeServeSection: Cycling started');
    }

    stopCycling() {
        if (this.cyclingInterval) {
            clearInterval(this.cyclingInterval);
            this.cyclingInterval = null;
            console.log('WeServeSection: Cycling stopped');
        }
    }

    nextWord() {
        // Move to next word (loop back to start at end)
        const previousIndex = this.currentWordIndex;
        this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
        
        this.showCurrentWord(previousIndex);
        
        console.log('WeServeSection: Cycled to word:', this.words[this.currentWordIndex]);
    }

    showCurrentWord(previousIndex = -1) {
        // Mark previous word as exiting
        if (previousIndex >= 0 && this.wordElements[previousIndex]) {
            this.wordElements[previousIndex].classList.remove('active');
            this.wordElements[previousIndex].classList.add('exiting');
        }

        // Show current word
        if (this.wordElements[this.currentWordIndex]) {
            // Remove any existing classes
            this.wordElements[this.currentWordIndex].classList.remove('exiting');
            
            // Add active class with a small delay for smooth transition
            setTimeout(() => {
                if (this.wordElements[this.currentWordIndex]) {
                    this.wordElements[this.currentWordIndex].classList.add('active');
                }
            }, 50);
        }

        // Clean up exiting class after animation completes
        if (previousIndex >= 0) {
            setTimeout(() => {
                if (this.wordElements[previousIndex]) {
                    this.wordElements[previousIndex].classList.remove('exiting');
                }
            }, 400); // Match CSS transition duration
        }
    }

}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('WeServeSection: DOM ready - creating instance');
    new WeServeSection();
});

// Also initialize immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('WeServeSection: DOM already ready - creating instance immediately');
    new WeServeSection();
}
