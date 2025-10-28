/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';
import ITSProduct from './custom/its-product';
import DualPanelScroll from './custom/dual-panel-scroll';
import SplitLayoutCarousel from './custom/split-layout-carousel';
import MobileStickyCartValidator from './custom/mobile-sticky-cart-validator';
import './product/image-gallery';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        // Remove hidden product form (mobile or desktop) from the DOM, robust for AJAX/Stencil swaps
        function removeHiddenProductForm() {
            var isMobile = window.innerWidth <= 1024;
            if (isMobile) {
                // Remove desktop form
                var desktopForm = document.querySelector('.details-panel .productView-options form');
                if (desktopForm) desktopForm.remove();
            } else {
                // Remove mobile form
                var mobileForm = document.querySelector('.details-panel-inline .productView-options form');
                if (mobileForm) mobileForm.remove();
            }
        }

        // Initial run
        removeHiddenProductForm();

        // MutationObserver to watch for DOM changes in the product details area
        var productView = document.querySelector('.productView');
        if (productView) {
            var observer = new MutationObserver(function(mutations) {
                // Remove hidden form whenever DOM changes
                removeHiddenProductForm();
            });
            observer.observe(productView, { childList: true, subtree: true });
        }

        // Also run on resize
        window.addEventListener('resize', function() {
            // Only run if both forms are present
            var desktopForm = document.querySelector('.details-panel .productView-options form');
            var mobileForm = document.querySelector('.details-panel-inline .productView-options form');
            if (desktopForm && mobileForm) removeHiddenProductForm();
        });

        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        // Fix duplicate IDs in details-panel-inline by appending '-inline' to all IDs and updating label 'for' attributes
        function fixInlinePanelIds() {
            const $inlinePanel = $('.details-panel-inline');
            $inlinePanel.find('[id]').each(function() {
                const oldId = $(this).attr('id');
                if (!oldId.endsWith('-inline')) {
                    const newId = oldId + '-inline';
                    // Update the element's ID
                    $(this).attr('id', newId);
                    // Update any label referencing this ID
                    $inlinePanel.find(`label[for="${oldId}"]`).attr('for', newId);
                }
            });
        }
        fixInlinePanelIds();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        // Inline/mobile panel
        if ($('.details-panel-inline').length) {
            this.productDetailsInline = new ProductDetails($('.details-panel-inline'), this.context, window.BCData.product_attributes);
            this.productDetailsInline.setProductVariant();
        }

        // --- Sync product options between main and inline forms ---
        function syncProductOptions(sourceFormSelector, targetFormSelector) {
            const $source = $(sourceFormSelector);
            const $target = $(targetFormSelector);
            $source.find('[name]').each(function() {
                const name = $(this).attr('name');
                // For radio/checkbox, sync checked state; for others, sync value
                const type = $(this).attr('type');
                if (type === 'radio' || type === 'checkbox') {
                    if ($(this).is(':checked')) {
                        $target.find(`[name="${name}"][value="${$(this).val()}"]`).prop('checked', true).trigger('change');
                    }
                } else {
                    $target.find(`[name="${name}"]`).val($(this).val()).trigger('change');
                }
            });
        }
        $('#productOptionsForm').on('change', function() {
            syncProductOptions('#productOptionsForm', '#productOptionsForm-inline');
        });
        $('#productOptionsForm-inline').on('change', function() {
            syncProductOptions('#productOptionsForm-inline', '#productOptionsForm');
        });

        // --- Update price in sticky cart section for inline panel ---
        function updateInlineStickyCartPrice() {
            // Get the updated price from the inline panel
            var inlinePrice = document.querySelector('.details-panel-inline .productView-price');
            var stickyPrice = document.querySelector('.sticky-cart-section-mobile .sticky-cart-product-price');
            if (inlinePrice && stickyPrice) {
                stickyPrice.innerHTML = inlinePrice.innerHTML;
            }
        }
        // Run once on page load
        updateInlineStickyCartPrice();
        // Run whenever product options change in inline panel
        document.querySelector('#productOptionsForm-inline')?.addEventListener('change', function(e) {
            setTimeout(updateInlineStickyCartPrice, 100);
        });
        // Also observe for price changes in inline panel (in case price updates via AJAX)
        var inlinePriceEl = document.querySelector('.details-panel-inline .productView-price');
        if (inlinePriceEl) {
            var observerInlineSticky = new MutationObserver(updateInlineStickyCartPrice);
            observerInlineSticky.observe(inlinePriceEl, { childList: true, subtree: true });
        }

        videoGallery();

        this.bulkPricingHandler();

        const $reviewForm = classifyForm('.writeReview-form');

        this.ITSProduct = new ITSProduct(this.context);
        
        // Initialize dual-panel scroll synchronization for split layout
        this.dualPanelScroll = new DualPanelScroll();
        
        // Initialize split layout carousel override
        this.splitLayoutCarousel = new SplitLayoutCarousel();
        
        // Initialize mobile sticky cart validator (scroll-to-error + popup notification)
        this.mobileStickyCartValidator = new MobileStickyCartValidator();
        
        if ($reviewForm.length === 0) return;

        const review = new Review({ $reviewForm });

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();

        // --- Sticky Cart Price Sync (Improved) ---
        function updateStickyCartPrice() {
            // Main price area
            var mainWithTax = document.querySelector('.productView .price--withTax');
            var mainWithoutTax = document.querySelector('.productView .price--withoutTax');
            // Sticky cart area
            var stickyWithTax = document.querySelector('.sticky-cart-product-price .price--withTax');
            var stickyWithoutTax = document.querySelector('.sticky-cart-product-price .price--withoutTax');
        
            if (mainWithTax && stickyWithTax) {
                stickyWithTax.innerHTML = mainWithTax.innerHTML;
            }
            if (mainWithoutTax && stickyWithoutTax) {
                stickyWithoutTax.innerHTML = mainWithoutTax.innerHTML;
            }
        }

        // Run once on page load
        updateStickyCartPrice();

        // Run whenever product options change
        document.addEventListener('change', function(e) {
            if (e.target.closest('.productView-options')) {
                setTimeout(updateStickyCartPrice, 100);
            }
        });

        // Also observe for price changes (in case price updates via AJAX)
        var mainPrice = document.querySelector('.productView-price');
        if (mainPrice) {
            var observerPrice = new MutationObserver(updateStickyCartPrice);
            observerPrice.observe(mainPrice, { childList: true, subtree: true });
        }

        // --- Sync data-product-price-without-tax in .details-panel-inline ---
        function updateInlinePanelPrice() {
            // Always copy from desktop/main panel to inline/mobile panel
            var mainPrice = document.querySelector('.details-panel .productView-price [data-product-price-without-tax]');
            var inlinePanel = document.querySelector('.details-panel-inline .productView-price [data-product-price-without-tax]');
            if (mainPrice && inlinePanel) {
                inlinePanel.innerHTML = mainPrice.innerHTML;
            }
        }

        // Run once on page load
        updateInlinePanelPrice();

        // Run whenever product options change
        document.addEventListener('change', function(e) {
            if (e.target.closest('.productView-options')) {
                setTimeout(updateInlinePanelPrice, 100);
            }
        });

        // Also observe for price changes (in case price updates via AJAX)
        var mainPriceInline = document.querySelector('.details-panel .productView-price [data-product-price-without-tax]');
        if (mainPriceInline) {
            var observerInline = new MutationObserver(updateInlinePanelPrice);
            observerInline.observe(mainPriceInline, { childList: true, subtree: true });
        }
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }
}
