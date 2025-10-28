import PhotoSwipe from 'photoswipe';
import PhotoSwipeUIDefault from 'photoswipe/dist/photoswipe-ui-default';

export default class AboutUsGallery {
    constructor() {
        this.$galleryImages = $('.about-trusted__img, .about-designed__img, .about-mission__img, .about-service__img');
        this.photoswipeItems = [];
        this.initialized = false;
        
        if (this.$galleryImages.length > 0) {
            this.init();
        }
    }

    init() {
        // Prevent double initialization
        if (this.initialized) {
            return;
        }
        
        this.buildPhotoSwipeCollection();
        this.bindEvents();
        this.makeImagesClickable();
        this.initialized = true;
        
        console.log('About Gallery initialized with', this.$galleryImages.length, 'images');
    }

    reinitialize() {
        // Force reinitialize (useful after PhotoSwipe issues)
        this.initialized = false;
        this.unbindEvents();
        this.init();
    }

    unbindEvents() {
        // Remove existing event handlers to prevent duplicates
        $(document).off('click', '.about-trusted__img, .about-designed__img, .about-mission__img, .about-service__img');
        $(document).off('click', '.about-trusted__image, .about-designed__image-item, .about-mission__image, .about-service__image');
        $(document).off('click', '.photo-zoom-icon');
    }

    makeImagesClickable() {
        // Add cursor pointer and enlarge icon to images
        this.$galleryImages.each((index, img) => {
            const $img = $(img);
            const $wrapper = $img.parent();
            
            // Add clickable styling
            $wrapper.css({
                'cursor': 'pointer',
                'position': 'relative',
                'overflow': 'hidden'
            });
            
            // Add zoom overlay icon
            if (!$wrapper.find('.photo-zoom-icon').length) {
                $wrapper.append(`
                    <div class="photo-zoom-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z" fill="white"/>
                            <path d="M12 10H10V12H9V10H7V9H9V7H10V9H12V10Z" fill="white"/>
                        </svg>
                    </div>
                `);
            }
            
            // Add data attributes for PhotoSwipe
            $img.attr({
                'data-about-gallery-item': index,
                'data-size': this.getImageSize($img[0])
            });
        });
    }

    getImageSize(img) {
        // Get natural dimensions or fallback to actual dimensions
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        return `${width}x${height}`;
    }

    buildPhotoSwipeCollection() {
        this.photoswipeItems = [];
        
        this.$galleryImages.each((index, img) => {
            const $img = $(img);
            
            // Handle both regular img tags and picture > img combinations
            let src = $img.attr('src') || $img.attr('data-src');
            
            // If image is inside a picture element, prefer the WebP source if available
            const $picture = $img.closest('picture');
            if ($picture.length > 0) {
                const $webpSource = $picture.find('source[type="image/webp"]');
                if ($webpSource.length > 0) {
                    const webpSrcset = $webpSource.attr('srcset');
                    if (webpSrcset) {
                        // Use the WebP source for PhotoSwipe (better quality)
                        src = webpSrcset.split(' ')[0]; // Take first URL from srcset
                    }
                }
            }
            
            const alt = $img.attr('alt') || '';
            const size = this.getImageSize(img).split('x');
            
            this.photoswipeItems.push({
                src: src,
                w: parseInt(size[0]),
                h: parseInt(size[1]),
                title: alt
            });
        });
    }

    bindEvents() {
        // Use event delegation to ensure events work after PhotoSwipe closes
        $(document).on('click', '.about-trusted__img, .about-designed__img, .about-mission__img, .about-service__img', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleClickImage(e);
        });

        // Handle wrapper clicks (for the zoom icon and wrapper area)
        $(document).on('click', '.about-trusted__image, .about-designed__image-item, .about-mission__image, .about-service__image', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const $img = $(e.currentTarget).find('img');
            if ($img.length) {
                const fakeEvent = { currentTarget: $img[0] };
                this.handleClickImage(fakeEvent);
            }
        });

        // Handle zoom icon clicks specifically
        $(document).on('click', '.photo-zoom-icon', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const $icon = $(e.currentTarget);
            const $wrapper = $icon.parent();
            const $img = $wrapper.find('img');
            
            if ($img.length) {
                const fakeEvent = { currentTarget: $img[0] };
                this.handleClickImage(fakeEvent);
            }
        });

        // Add PhotoSwipe lifecycle event handlers to ensure proper cleanup
        $(document).on('pswpTap pswpClose', () => {
            // Re-enable clicks after PhotoSwipe closes
            console.log('PhotoSwipe closed, events should be active');
        });
    }

    handleClickImage(e) {
        console.log('About Gallery: Image clicked', e.currentTarget);
        
        const $target = $(e.currentTarget);
        const itemIndex = parseInt($target.attr('data-about-gallery-item'));
        
        console.log('About Gallery: Opening PhotoSwipe with index:', itemIndex);
        
        if (isNaN(itemIndex)) {
            console.error('About Gallery: Invalid item index:', itemIndex, 'for element:', $target[0]);
            return;
        }
        
        this.openPhotoSwipe(itemIndex);
    }

    openPhotoSwipe(itemIndex) {
        const pswpElement = document.querySelectorAll('.pswp')[0];
        
        if (!pswpElement) {
            console.warn('PhotoSwipe element not found. Make sure PhotoSwipe component is included.');
            return;
        }

        const options = {
            index: itemIndex || 0,
            bgOpacity: 0.9,
            showHideOpacity: true,
            showAnimationDuration: 330,
            hideAnimationDuration: 330,
            closeEl: true,
            captionEl: true,
            fullscreenEl: true,
            zoomEl: true,
            shareEl: false,
            counterEl: true,
            arrowEl: true,
            preloaderEl: true,
            tapToClose: true,
            tapToToggleControls: true,
            history: false,
            focus: true,
            modal: true,
            escKey: true,
            arrowKeys: true
        };

        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUIDefault, this.photoswipeItems, options);
        
        // Add event listeners before initializing
        gallery.listen('afterChange', () => {
            // Gallery image changed - you can add custom behavior here if needed
            console.log('PhotoSwipe: Image changed');
        });

        gallery.listen('close', () => {
            // Ensure event handlers are restored when gallery closes
            console.log('PhotoSwipe: Gallery closed, restoring click handlers');
            
            // Small delay to ensure PhotoSwipe has fully closed
            setTimeout(() => {
                // Re-enable any disabled elements
                this.$galleryImages.css('pointer-events', 'auto');
                this.$galleryImages.parent().css('pointer-events', 'auto');
                
                // Verify that click handlers are still working
                this.verifyEventHandlers();
            }, 100);
        });

        gallery.listen('destroy', () => {
            console.log('PhotoSwipe: Gallery destroyed');
            // Cleanup any PhotoSwipe-specific modifications
        });
        
        gallery.init();

        // Ensure images remain clickable
        this.$galleryImages.css('pointer-events', 'auto');
        this.$galleryImages.parent().css('pointer-events', 'auto');
    }

    verifyEventHandlers() {
        // Test if event handlers are still working by checking if images are properly configured
        const $testImage = this.$galleryImages.first();
        if ($testImage.length) {
            const hasDataAttribute = $testImage.attr('data-about-gallery-item') !== undefined;
            const hasPointerEvents = $testImage.css('pointer-events') !== 'none';
            
            console.log('Event handler verification:', {
                hasDataAttribute,
                hasPointerEvents,
                imageCount: this.$galleryImages.length
            });
            
            if (!hasDataAttribute || !hasPointerEvents) {
                console.warn('Event handlers may be broken, reinitializing...');
                setTimeout(() => {
                    this.reinitialize();
                }, 50);
            }
        }
    }
}
