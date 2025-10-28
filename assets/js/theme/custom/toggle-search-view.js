import { api } from '@bigcommerce/stencil-utils';
import urlUtils from '../common/utils/url-utils';

export default class ToggleSearchView {
    constructor(context) {
        this.context = context;
        this.defaultViewType = this.context.defaultViewType || 'list';
        this.oppositeViewType = this.defaultViewType !== 'grid' ? 'grid' : 'list';
        this.productsPerPage = this.context.searchProductsPerPage;
        this.loadingOverlay = $('.loadingOverlay.loadingOverlay--product-listing');

        console.log('ToggleSearchView initialized:', {
            defaultViewType: this.defaultViewType,
            oppositeViewType: this.oppositeViewType,
            storedViewType: sessionStorage.getItem('search-view-type'),
            searchProductsPerPage: this.productsPerPage
        });

        // Handle view mode change events from faceted search
        $('body').on('productViewModeChanged', () => {
            this.addToggleEvents();
            this.addStyleClass();
        });

        this.init();
    }

    getStoredViewType() {
        return sessionStorage.getItem('search-view-type') || null;
    }

    storeViewType(type) {
        sessionStorage.setItem('search-view-type', type);
    }

    addStyleClass() {
        if ($('.listItem').length) {
            $('body').addClass('list-view');
        } else {
            $('body').removeClass('list-view');
        }
    }

    getSearchPage(pageType) {
        const currentUrl = window.location.href;
        
        const config = {
            config: {
                product_results: {
                    limit: this.productsPerPage,
                },
            },
            template: `components/search/product-listing`,
        };

        this.loadingOverlay.show();

        api.getPage(currentUrl, config, (err, content) => {
            if (err) {
                console.error('Error loading search page:', err);
                this.loadingOverlay.hide();
                return;
            }

            $('#product-listing-container').html(content);
            this.loadingOverlay.hide();
            this.storeViewType(pageType);
            this.addToggleEvents();
            this.addStyleClass();

            // Trigger events for consistency
            $('body').triggerHandler('productViewModeChanged');
        });
    }

    addToggleEvents() {
        $('.js-category__toggle-view').off('click.searchToggle').on('click.searchToggle', (e) => {
            const type = $(e.currentTarget).data('view-type');

            if ($(e.currentTarget).hasClass('active-category-view')) return;

            // Update active state immediately for better UX
            $('.js-category__toggle-view').removeClass('active-category-view');
            $(e.currentTarget).addClass('active-category-view');

            // Store the preference and reload to apply server-side template change
            this.storeViewType(type);
            
            // For search pages, we need to trigger a full reload since 
            // we can't easily re-render server-side templates client-side
            this.reloadWithViewPreference();
        });
    }

    reloadWithViewPreference() {
        // Store current scroll position
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        sessionStorage.setItem('search-scroll-position', scrollPos);
        
        // Reload the page - the server will pick up the stored view preference
        window.location.reload();
    }

    restoreScrollPosition() {
        const scrollPos = sessionStorage.getItem('search-scroll-position');
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
            sessionStorage.removeItem('search-scroll-position');
        }
    }

    init() {
        const storedViewType = this.getStoredViewType();
        
        console.log('Search view init:', {
            storedViewType,
            defaultViewType: this.defaultViewType
        });

        // Set initial view state based on stored preference
        if (storedViewType) {
            $('.js-category__toggle-view').removeClass('active-category-view');
            $(`.js-category__toggle-view[data-view-type="${storedViewType}"]`).addClass('active-category-view');
        }

        // Add toggle event listeners
        this.addToggleEvents();
        this.addStyleClass();
        
        // Restore scroll position if returning from a view toggle
        this.restoreScrollPosition();
    }
}
