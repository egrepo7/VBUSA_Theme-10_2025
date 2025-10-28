/**
 * Floating Label Handler for Product Options
 * Manages the floating label effect for product option dropdowns
 */

export default class FloatingLabel {
    constructor() {
        this.selectors = {
            floatingField: '.form-field--floating-label',
            select: '.form-field--floating-label select',
            label: '.floating-label'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkInitialState();
    }

    bindEvents() {
        // Handle select change - this is the main event we care about
        $(document).on('change', this.selectors.select, (event) => {
            this.handleChange(event);
        });
    }

    handleChange(event) {
        const $select = $(event.target);
        const $field = $select.closest(this.selectors.floatingField);
        
        if (this.hasValue($select)) {
            $field.addClass('has-selection');
            $select.addClass('has-value');
        } else {
            $field.removeClass('has-selection');
            $select.removeClass('has-value');
        }
    }

    hasValue($select) {
        const value = $select.val();
        // Check if a real option is selected (not the placeholder)
        return value && value !== '' && value !== null;
    }

    checkInitialState() {
        // Check all selects on page load to see if they already have values
        $(this.selectors.select).each((index, element) => {
            const $select = $(element);
            const $field = $select.closest(this.selectors.floatingField);
            
            if (this.hasValue($select)) {
                $field.addClass('has-selection');
                $select.addClass('has-value');
            } else {
                $field.removeClass('has-selection');
                $select.removeClass('has-value');
            }
        });
    }

    // Method to refresh state - useful after dynamic content changes
    refresh() {
        this.checkInitialState();
    }
}
