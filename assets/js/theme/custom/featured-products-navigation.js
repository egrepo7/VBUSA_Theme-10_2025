// Featured Products Carousel Navigation - Performance Optimized
console.log('🚀 CAROUSEL JS: File loaded');

// Global initialization function for compatibility
window.initializeFeaturedCarousels = function() {
    initializeCarousels();
};

// Fast initialization
(function() {
    function init() {
        var attempts = 0;
        var maxAttempts = 3;
        
        function tryInit() {
            attempts++;
            if (attempts > maxAttempts) return;
            
            var carousels = document.querySelectorAll('.featured-products-carousel');
            if (carousels.length === 0) {
                setTimeout(tryInit, 200);
                return;
            }
            
            carousels.forEach(function(carousel, index) {
                setupCarousel(carousel, index);
            });
        }
        
        tryInit();
    }
    
    // Multiple init strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // BrowserSync compatibility
    if (window.___browserSync___) {
        window.___browserSync___.socket.on('reload', function() {
            setTimeout(init, 200);
        });
    }
})();

function initializeCarousels() {
    var carousels = document.querySelectorAll('.featured-products-carousel');
    carousels.forEach(function(carousel, index) {
        setupCarousel(carousel, index);
    });
}

function setupCarousel(carousel, index) {
    var track = carousel.querySelector('.carousel-track');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var prevBtn = carousel.querySelector('.carousel-btn--prev');
    var nextBtn = carousel.querySelector('.carousel-btn--next');
    var container = carousel.querySelector('.carousel-track-container');
    
    if (!track || !container || slides.length === 0) return;
    
    var currentIndex = 0;
    
    function calculateDimensions() {
        var slide = slides[0];
        var slideWidth = slide.offsetWidth;
        var gap = 24; // 1.5rem gap from CSS
        var slideWithGap = slideWidth + gap;
        var containerWidth = container.offsetWidth;
        var visibleSlides = Math.floor(containerWidth / slideWithGap);
        var maxIndex = Math.max(0, slides.length - visibleSlides);
        
        return {
            slideWithGap: slideWithGap,
            maxIndex: maxIndex
        };
    }
    
    var dimensions = calculateDimensions();
    
    function moveCarousel() {
        dimensions = calculateDimensions();
        currentIndex = Math.min(currentIndex, dimensions.maxIndex);
        
        var offset = currentIndex * dimensions.slideWithGap;
        track.style.transform = 'translateX(-' + offset + 'px)';
        track.style.transition = 'transform 0.4s ease';
        
        updateButtons();
    }
    
    function updateButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= dimensions.maxIndex;
            nextBtn.style.opacity = currentIndex >= dimensions.maxIndex ? '0.5' : '1';
        }
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                moveCarousel();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentIndex < dimensions.maxIndex) {
                currentIndex++;
                moveCarousel();
            }
        });
    }
    
    // Initialize
    moveCarousel();
    
    // Handle resize efficiently
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(moveCarousel, 250);
    });
}
