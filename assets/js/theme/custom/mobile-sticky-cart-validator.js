/**
 * Mobile Sticky Cart Validator
 * 
 * Implements scroll-to-error and popup notification functionality
 * similar to VolleyballUSA.com. Only activates on mobile when 
 * sticky cart is visible - won't interfere with desktop dual-panel scrolling.
 */

export default class MobileStickyCartValidator {
    constructor() {
        this.init();
    }

    init() {
        this.setupClickHandler();
        this.setupGlobalFunctions();
    }

    setupClickHandler() {
        // Only handle clicks on mobile sticky cart add-to-cart button
        $(document).on('click', '.sticky-cart-section-mobile #form-action-addToCart-mobile', (e) => {
            
            // Only proceed if sticky cart is visible (mobile/tablet view)
            if ($('.sticky-cart-section-mobile').is(':visible')) {
                const formId = $(e.target).attr('form') || 'productOptionsForm-inline';
                const $form = $('#' + formId);
                
                
                if ($form.length) {
                    e.preventDefault();
                    
                    // Check for validation errors
                    if (this.validateForm($form)) {
                        $form.submit();
                    } else {
                        this.scrollToFirstValidationError($form);
                    }
                } else {
                }
            } else {
            }
        });
    }

    validateForm($form) {
        // Check for required selects that haven't been selected
        const $requiredSelects = $form.find('select[required]');
        const $unselectedRequired = $requiredSelects.filter(function() {
            return $(this).val() === '' || $(this).prop('selectedIndex') === 0;
        });
        
        
        return $unselectedRequired.length === 0;
    }

    scrollToFirstValidationError($form) {
        
        setTimeout(() => {
            
            // Look for existing form validation errors first
            let $errorField = $form.find('.form-field--error').first();
            
            if ($errorField.length === 0) {
                $errorField = $('.form-field--error').first();
            }
            
            if ($errorField.length > 0) {
                this.smoothScrollToElement($errorField, 'Error Field');
            } else {
                
                // Find first unselected required option
                const $unselectedRequired = $form.find('[data-product-attribute] select').filter(function() {
                    const $select = $(this);
                    const $attribute = $select.closest('[data-product-attribute]');
                    const isRequired = $attribute.find('label').text().toLowerCase().includes('required') || 
                                     $select.attr('required') !== undefined;
                    const isUnselected = $select.val() === '' || $select.prop('selectedIndex') === 0;
                    
                    if (isRequired && isUnselected) {
                    }
                    
                    return isRequired && isUnselected;
                }).first().closest('[data-product-attribute]');
                
                if ($unselectedRequired.length > 0) {
                    this.smoothScrollToElement($unselectedRequired, 'Required Option');
                } else {
                    this.smoothScrollToElement($form, 'Form');
                }
            }
        }, 100);
    }

    smoothScrollToElement($element, elementName = 'Element') {
        if ($element.length) {
            const currentScroll = $(window).scrollTop();
            const elementOffset = $element.offset();
            const targetScroll = elementOffset.top - 100;
            
            
            $('html, body').animate({
                scrollTop: targetScroll
            }, {
                duration: 600,
                easing: 'swing',
                start: function() {
                },
                complete: function() {
                    
                    // Add highlight effect
                    $element.addClass('scroll-highlight');
                    
                    setTimeout(() => {
                        $element.removeClass('scroll-highlight');
                    }, 2000);
                    
                    // Show notification popup
                    this.showRequiredOptionsNotification();
                }.bind(this)
            });
        } else {
        }
    }

    showRequiredOptionsNotification() {
        
        // Remove any existing notifications
        $('.required-options-notification').remove();
        
        // Create notification HTML
        const $notification = $(`
            <div class="required-options-notification">
                <div class="notification-content">
                    <div class="notification-icon">⚠️</div>
                    <div class="notification-text">
                        <strong>Required Options Missing</strong>
                        <p>Please select all required options before adding to cart</p>
                        <small class="notification-hint">Click to dismiss</small>
                    </div>
                    <button class="notification-close">&times;</button>
                </div>
            </div>
        `);
        
        // Add to body and show with fade effect
        $('body').append($notification);
        $notification.hide().fadeIn(400);
        
        // Click to dismiss entire notification
        $notification.on('click', function(e) {
            $(this).fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Close button (prevent event bubbling)
        $notification.find('.notification-close').on('click', function(e) {
            e.stopPropagation();
            $(this).closest('.required-options-notification').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            $notification.fadeOut(400, function() {
                $(this).remove();
            });
        }, 5000);
        
    }

    setupGlobalFunctions() {
        // Global test function for debugging
        window.showRequiredOptionsNotification = this.showRequiredOptionsNotification.bind(this);
        window.testNotification = () => {
            this.showRequiredOptionsNotification();
        };
        
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileStickyCartValidator();
});
