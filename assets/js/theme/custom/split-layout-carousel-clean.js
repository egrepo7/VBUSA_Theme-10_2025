/**
 * Split Layout Carousel - Clean Implementation
 * Handles vertical thumbnail navigation using original .productView-thumbnails structure
 * No dependency on Slick carousel - works with the native list structure
 */

export default class SplitLayoutCarousel {
    constructor() {
        this.thumbnailContainer = null;
        this.thumbnails = [];
        this.isScrolling = false;
        this.init();
    }

    init() {
        // Only initialize if we're in split layout mode
        if (!document.querySelector('.productView.split-layout')) {
            return;
        }

        this.thumbnailContainer = document.querySelector('.productView.split-layout .productView-thumbnails');
        
        if (!this.thumbnailContainer) {
            return;
        }

        this.setupThumbnails();
        this.setupNavigation();
        this.updateNavigationVisibility();
        
        // Listen for window resize to update navigation
        window.addEventListener('resize', () => {
            this.updateNavigationVisibility();
        });

        console.log('Split Layout Carousel initialized (clean implementation)');
    }

    setupThumbnails() {
        // Disable Slick if it exists
        this.disableSlick();

        // Get all thumbnail list items (direct children of .productView-thumbnails)
        this.thumbnails = Array.from(this.thumbnailContainer.querySelectorAll('li'));
        
        console.log(`Found ${this.thumbnails.length} thumbnails`);

        // Ensure vertical layout
        this.enforceVerticalLayout();
    }

    disableSlick() {
        // Completely disable Slick if it's initialized
        if (this.thumbnailContainer.classList.contains('slick-initialized')) {
            // Try to destroy Slick if the unslick method exists
            if (typeof $ !== 'undefined' && $(this.thumbnailContainer).slick) {
                try {
                    $(this.thumbnailContainer).slick('unslick');
                    console.log('Slick carousel destroyed');
                } catch (e) {
                    console.log('Could not destroy Slick, proceeding with override');
                }
            }
        }

        // Force original structure to be visible by hiding Slick elements
        const slickElements = this.thumbnailContainer.querySelectorAll('.slick-list, .slick-track, .slick-dots, .slick-arrow');
        slickElements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        });

        // Remove Slick classes
        this.thumbnailContainer.classList.remove('slick-initialized', 'slick-slider');
        
        // Remove data-slick attribute to prevent re-initialization
        this.thumbnailContainer.removeAttribute('data-slick');
    }

    enforceVerticalLayout() {
        // Apply styles directly to ensure vertical layout
        Object.assign(this.thumbnailContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '80px',
            maxHeight: '520px',
            overflowY: 'auto',
            overflowX: 'hidden',
            listStyle: 'none',
            margin: '0',
            padding: '40px 0',
            scrollBehavior: 'smooth'
        });

        // Style individual thumbnails
        this.thumbnails.forEach((thumbnail, index) => {
            Object.assign(thumbnail.style, {
                display: 'block',
                width: '80px',
                height: '80px',
                margin: '0',
                padding: '0',
                flexShrink: '0',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid transparent',
                transition: 'border-color 0.2s ease',
                cursor: 'pointer'
            });

            // Style thumbnail images
            const img = thumbnail.querySelector('img');
            if (img) {
                Object.assign(img.style, {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '6px'
                });
            }

            // Add hover effects
            thumbnail.addEventListener('mouseenter', () => {
                thumbnail.style.borderColor = '#d32f2f';
            });

            thumbnail.addEventListener('mouseleave', () => {
                if (!thumbnail.classList.contains('is-active')) {
                    thumbnail.style.borderColor = 'transparent';
                }
            });

            // Add click handler for thumbnail navigation
            thumbnail.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveThumbnail(index);
                this.scrollToThumbnail(index);
            });
        });
    }

    setupNavigation() {
        // Add navigation arrows using pseudo-elements (styled in CSS)
        // But we need to handle the click events

        this.thumbnailContainer.addEventListener('click', (e) => {
            const rect = this.thumbnailContainer.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            
            // Check if click is in the top arrow area (0-44px)
            if (clickY >= 0 && clickY <= 44) {
                this.scrollUp();
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Check if click is in the bottom arrow area (last 44px)
            else if (clickY >= rect.height - 44 && clickY <= rect.height) {
                this.scrollDown();
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Update arrow visibility on scroll
        this.thumbnailContainer.addEventListener('scroll', () => {
            this.updateNavigationVisibility();
        });
    }

    scrollUp() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const scrollAmount = 88; // Thumbnail height (80px) + gap (8px)
        
        this.thumbnailContainer.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
        });

        setTimeout(() => {
            this.isScrolling = false;
            this.updateNavigationVisibility();
        }, 300);
    }

    scrollDown() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const scrollAmount = 88; // Thumbnail height (80px) + gap (8px)
        
        this.thumbnailContainer.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
        });

        setTimeout(() => {
            this.isScrolling = false;
            this.updateNavigationVisibility();
        }, 300);
    }

    updateNavigationVisibility() {
        if (!this.thumbnailContainer) return;

        const { scrollTop, scrollHeight, clientHeight } = this.thumbnailContainer;
        
        // Check if we can scroll up (not at the top)
        const canScrollUp = scrollTop > 5; // Small threshold for precision
        
        // Check if we can scroll down (not at the bottom)
        const canScrollDown = scrollTop < (scrollHeight - clientHeight - 5); // Small threshold

        // Update CSS classes for arrow visibility
        this.thumbnailContainer.classList.toggle('can-scroll-up', canScrollUp);
        this.thumbnailContainer.classList.toggle('can-scroll-down', canScrollDown);
    }

    scrollToThumbnail(index) {
        if (index < 0 || index >= this.thumbnails.length) return;

        const thumbnail = this.thumbnails[index];
        const containerTop = this.thumbnailContainer.scrollTop;
        const containerHeight = this.thumbnailContainer.clientHeight;
        const thumbnailTop = thumbnail.offsetTop - this.thumbnailContainer.offsetTop;
        const thumbnailHeight = thumbnail.offsetHeight;

        // Check if thumbnail is fully visible
        const isFullyVisible = thumbnailTop >= containerTop && 
                              (thumbnailTop + thumbnailHeight) <= (containerTop + containerHeight);

        if (!isFullyVisible) {
            // Scroll to center the thumbnail in the container
            const scrollTo = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2);
            
            this.thumbnailContainer.scrollTo({
                top: Math.max(0, scrollTo),
                behavior: 'smooth'
            });
        }

        setTimeout(() => {
            this.updateNavigationVisibility();
        }, 300);
    }

    setActiveThumbnail(index) {
        // Remove active state from all thumbnails
        this.thumbnails.forEach(thumbnail => {
            thumbnail.classList.remove('is-active');
            thumbnail.style.borderColor = 'transparent';
        });

        // Set active state on selected thumbnail
        if (this.thumbnails[index]) {
            this.thumbnails[index].classList.add('is-active');
            this.thumbnails[index].style.borderColor = '#d32f2f';
        }
    }

    // Public method to handle external thumbnail clicks
    handleThumbnailClick(index) {
        this.setActiveThumbnail(index);
        this.scrollToThumbnail(index);
    }
}
