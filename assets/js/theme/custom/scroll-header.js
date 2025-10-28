/**
 * Scroll-triggered header behavior
 * Hides header on scroll down, shows on scroll up
 */
export default function scrollHeader() {
    const header = document.querySelector('.header-2');
    const body = document.body;
    
    if (!header) return;

    let lastScrollTop = 0;
    let isScrolling = false;
    let scrollTimeout;
    let headerHeight = 0;
    
    // Configuration
    const config = {
        scrollThreshold: 5, // Minimum scroll distance to trigger (reduced for immediate response)
        scrollDebounce: 16, // ~60fps
        hideDelay: 0, // No delay - hide immediately when scrolling down
        showDelay: 0, // No delay - show immediately when scrolling up
        transitionDuration: 300, // Match CSS transition duration
    };

    // Initialize the scroll header system
    function init() {
        // Calculate header height
        headerHeight = header.offsetHeight;
        
        // Set initial CSS custom property for header height
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        
        // Check if we're on a product page and handle differently
        const isProductPage = document.body.classList.contains('page--product');
        
        if (!isProductPage) {
            // Add body padding to prevent content jump (except on product pages)
            body.classList.add('header-padding-active');
            body.style.paddingTop = `${headerHeight}px`;
        }
        
        // Make header fixed
        header.classList.add('header--visible');
        body.classList.add('header-visible');
        body.classList.remove('header-hidden');
        
        // Initialize layout properties
        updateLayoutProperties();
        
        // Set up scroll listener
        setupScrollListener();
        
        // Handle window resize
        window.addEventListener('resize', debounce(handleResize, 250));
        
        console.log('Scroll header initialized', { isProductPage, headerHeight });
    }

    // Set up optimized scroll event listener
    function setupScrollListener() {
        let ticking = false;

        function handleScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateHeaderVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        }

        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Main function to update header visibility based on scroll
    function updateHeaderVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;
        
        // Don't do anything if scroll distance is too small
        if (Math.abs(scrollDelta) < config.scrollThreshold) {
            return;
        }

        // Clear any existing timeout
        clearTimeout(scrollTimeout);

        // Determine scroll direction and visibility
        const isScrollingDown = scrollDelta > 0;
        const isScrollingUp = scrollDelta < 0;
        const isAtTop = scrollTop <= headerHeight;
        
        // Check if we're in specific sections that should keep header hidden
        const isInWeServeSection = body.classList.contains('we-serve-active');
        const isInClientsSection = body.classList.contains('clients-active');
        
        // Add scrolled class for styling when not at top
        if (scrollTop > headerHeight / 2) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        // Handle header visibility with special section logic
        if (isAtTop) {
            // Always show header when at top
            showHeader();
        } else if (isInWeServeSection || isInClientsSection) {
            // Always hide header when in WE SERVE or clients section
            hideHeader();
        } else if (isScrollingDown) {
            // Hide header immediately when scrolling down (normal behavior)
            hideHeader();
        } else if (isScrollingUp) {
            // Show header immediately when scrolling up (normal behavior)
            showHeader();
        }

        // Update CSS custom properties for dynamic layout calculations
        updateLayoutProperties();

        lastScrollTop = scrollTop;
    }

    // Update CSS custom properties for dynamic layouts
    function updateLayoutProperties() {
        const isHeaderVisible = header.classList.contains('header--visible');
        const currentHeaderHeight = isHeaderVisible ? headerHeight : 0;
        
        // Update CSS custom properties for panels and other sticky elements
        document.documentElement.style.setProperty('--effective-header-height', `${currentHeaderHeight}px`);
        document.documentElement.style.setProperty('--panel-top-offset', `${currentHeaderHeight}px`);
        document.documentElement.style.setProperty('--panel-available-height', `${window.innerHeight - currentHeaderHeight}px`);
    }

    // Show the header
    function showHeader() {
        header.classList.remove('header--hidden');
        header.classList.add('header--visible');
        body.classList.remove('header-hidden');
        body.classList.add('header-visible');
        
        // Update layout properties for dynamic elements
        updateLayoutProperties();
        
        // Restore body padding (except on product pages)
        const isProductPage = document.body.classList.contains('page--product');
        if (!isProductPage) {
            body.style.paddingTop = `${headerHeight}px`;
        }
    }

    // Hide the header
    function hideHeader() {
        header.classList.remove('header--visible');
        header.classList.add('header--hidden');
        body.classList.remove('header-visible');
        body.classList.add('header-hidden');
        
        // Update layout properties for dynamic elements
        updateLayoutProperties();
        
        // Keep body padding to prevent layout shift (except on product pages)
        const isProductPage = document.body.classList.contains('page--product');
        if (!isProductPage) {
            body.style.paddingTop = `${headerHeight}px`;
        }
    }

    // Handle window resize
    function handleResize() {
        // Recalculate header height
        const newHeaderHeight = header.offsetHeight;
        
        if (newHeaderHeight !== headerHeight) {
            headerHeight = newHeaderHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            
            // Update body padding only if not on product page
            const isProductPage = document.body.classList.contains('page--product');
            if (!isProductPage) {
                body.style.paddingTop = `${headerHeight}px`;
            }
        }
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    return {
        init,
        show: showHeader,
        hide: hideHeader,
        isVisible: () => header.classList.contains('header--visible')
    };
}
