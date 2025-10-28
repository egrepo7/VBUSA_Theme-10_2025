import { api } from '@bigcommerce/stencil-utils';
import urlUtils from '../common/utils/url-utils';

export default class ToggleCategoryListingView {
    constructor(context) {
        // EMERGENCY: Block this entire class for volleyball nets page
        if (window.customVolleyballNetsPage || window.blockToggleCategoryListingView || window.emergencyCarouselProtection) {
            console.log('TOGGLE-CATEGORY-LISTING-VIEW: Completely blocked for volleyball nets page');
            // Return a safe, non-functional object
            this.init = () => { console.log('ToggleCategoryListingView.init() blocked'); };
            this.fullWidthTemplate = () => { console.log('ToggleCategoryListingView.fullWidthTemplate() blocked'); return false; };
            this.getRequestTemplateType = () => { console.log('ToggleCategoryListingView.getRequestTemplateType() blocked'); return 'grid'; };
            this.destroy = () => { console.log('ToggleCategoryListingView.destroy() blocked'); };
            return;
        }

        this.context = context;
        this.defaultViewType = this.context.defaultViewType || 'list'; // Fallback to list if not set
        this.oppositeViewType = this.defaultViewType !== 'grid' ? 'grid' : 'list';
        
        // Use search-specific products per page for search pages
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        this.productsPerPage = isSearchPage ? 
            (this.context.searchProductsPerPage || this.context.categoryProductsPerPage) : 
            this.context.categoryProductsPerPage;
            
        this.loadingOverlay = $('.loadingOverlay.loadingOverlay--product-listing');

        // Debug logging for browser differences and localhost issues
        console.log('ToggleCategoryListingView initialized:', {
            defaultViewType: this.defaultViewType,
            oppositeViewType: this.oppositeViewType,
            storedViewType: sessionStorage.getItem('category-view-type'),
            userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                      navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
            isLocalhost: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'),
            contextDefaultView: this.context.defaultViewType
        });

        $('body').on('facetedSearchRefresh', () => {
            this.addToggleEvents();
        });

        this.init();
        this.fullWidthTemplate();
    }

    getProductDescriptions() {
        if ($('.listItem').length) {
            console.log('IntuitSolutions -- Category Product Descriptions');

            const $products = $('.listItem').toArray();
            
            const $productIDs = $products.map(item => {
                return Number($(item).attr('data-entity-id'));
            });
            
            const $graphQLToken = $('body').data('graphql');
            fetch('/graphql', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${$graphQLToken}`
                },
                body: JSON.stringify({
                    query: `query {
                        site {
                            products(entityIds: [${$productIDs}], first: ${this.context.categoryProductsPerPage}) {
                                edges {
                                    node {
                                        entityId
                                        name
                                        description
                                    }
                                }
                            }
                        }
                    }`,
                }),
            })
            .then(res => res.json())
            .then(request => {
                const gqlProducts = request.data.site.products.edges;
                console.log(gqlProducts);

                $products.forEach((product, i) => {
                    gqlProducts.forEach(item => {
                        if ($(product).data('entityId') === item.node.entityId) {
                            $(product).find('.listItem__description').html(item.node.description);
                        }
                    })
                });
            });
        }
    }

    getStoredViewType() {
        // Use different storage keys for search vs category pages
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        const storageKey = isSearchPage ? 'search-view-type' : 'category-view-type';
        return sessionStorage.getItem(storageKey) || null;
    }

    getRequestTemplateType(type) {
        const pageType = this.getStoredViewType();
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        
        if (isSearchPage) {
            return pageType ? `custom/search-${pageType}-view` : `custom/search/full-width-product-listing`;
        } else {
            return pageType ? `custom/category-${pageType}-view` : `${type}/product-listing`;
        }
    }

    storeViewType(type) {
        // Use different storage keys for search vs category pages
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        const storageKey = isSearchPage ? 'search-view-type' : 'category-view-type';
        sessionStorage.setItem(storageKey, type);
        console.log(`Stored view type "${type}" with key "${storageKey}"`);
    }

    addStyleClass() {
        if ($('.listItem').length) {
            $('body').addClass('list-view');
        } else {
            $('body').removeClass('list-view');
        }
    }

    getCategoryPage(pageType, callback) {
        // Check if we're on a search page
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        
        let config;
        
        if (isSearchPage) {
            // For search pages, use search-specific templates
            config = {
                config: {
                    product_results: {
                        limit: this.productsPerPage,
                    },
                },
                template: `custom/search-${pageType}-view`,
            };
        } else {
            // For category pages, use category templates
            config = {
                config: {
                    category: {
                        shop_by_price: true,
                        products: {
                            limit: this.productsPerPage,
                        },
                    },
                },
                template: `custom/category-${pageType}-view`,
            };
        }

        this.loadingOverlay.show();

        // For search pages, preserve search parameters in the URL
        const currentUrl = isSearchPage ? 
            urlUtils.getUrl() : // Search URLs already contain the search query
            urlUtils.getUrl();

        api.getPage(currentUrl, config, (err, content) => {
            if (err) {
                console.error('Error loading page:', err);
                this.loadingOverlay.hide();
                return;
            }

            $('#product-listing-container').html(content);

            this.loadingOverlay.hide();

            this.storeViewType(pageType);

            // Ensure active state is set correctly after content load
            $('.js-category__toggle-view').removeClass('active-category-view');
            $(`.js-category__toggle-view[data-view-type="${pageType}"]`).addClass('active-category-view');

            if (callback) {
                callback();
            } else {
                this.addToggleEvents();
            }

            // Trigger events for filter restoration
            $('body').triggerHandler('productViewModeChanged');
            
            // Also trigger a more specific event for filter tabs
            $('body').triggerHandler('categoryFilterTabsRefresh');

            this.fullWidthTemplate();
        });
    }

    addToggleEvents() {
        $('.js-category__toggle-view').off('click.toggleView').on('click.toggleView', (e) => {
            const type = $(e.currentTarget).data('view-type');

            if ($(e.currentTarget).hasClass('active-category-view')) return;

            // Update active states immediately
            $('.js-category__toggle-view').removeClass('active-category-view');
            $(e.currentTarget).addClass('active-category-view');

            this.getCategoryPage(type, () => {
                this.addToggleEvents();
            });
        });
    }

    fullWidthTemplate() {
        if ($('.list-full-width').length) {
            this.getProductDescriptions();
            this.addStyleClass();

            // aGFja3kgc29sdXRpb24=
            $(window).on('load', () => {
                $('.list-img-container').toArray().forEach(img => {
                    if ($(img).height() > 620) {
                        $(img).addClass('adjust-list-img-height');
                    }
                })
            });
        }
    }

    init() {
        const storedViewType = this.getStoredViewType();
        
        // Enhanced detection for filter tabs template
        const isFilterTabsTemplate = window.location.pathname.includes('nets') || 
                                   document.querySelector('.category-hero--filter-tabs') ||
                                   document.querySelector('.subcategory-tabs--alt') ||
                                   document.body.classList.contains('category-filter-tabs');
        
        // Check if we're on a search page
        const isSearchPage = window.location.pathname.includes('/search') || 
                            document.querySelector('#search-results-product-count');
        
        console.log('Init debug:', {
            storedViewType,
            defaultViewType: this.defaultViewType,
            isFilterTabsTemplate,
            isSearchPage,
            pathname: window.location.pathname,
            isLocalhost: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        });
        
        // Set initial active state based on stored preference or default
        const currentViewType = storedViewType || this.defaultViewType;
        $('.js-category__toggle-view').removeClass('active-category-view');
        $(`.js-category__toggle-view[data-view-type="${currentViewType}"]`).addClass('active-category-view');
        
        // ALWAYS respect the defaultViewType from theme settings for initial load
        // This fixes the localhost/browsersync issue where it defaults to grid
        if (!storedViewType) {
            console.log('No stored view type - using theme default:', this.defaultViewType);
            // If default is list, make sure we're in list view without making an AJAX call
            if (this.defaultViewType === 'list') {
                this.addStyleClass(); // Add list-view class if needed
            }
            return this.addToggleEvents();
        }
        
        // For filter tabs template, always respect the injected defaultViewType
        if (isFilterTabsTemplate) {
            // Clear any conflicting stored view type for filter tabs
            if (storedViewType !== this.defaultViewType) {
                console.log('Clearing conflicting stored view type for filter tabs');
                sessionStorage.removeItem('category-view-type');
            }
            // Force the default view type for filter tabs
            return this.addToggleEvents();
        }

        // For regular category pages with stored preference
        if (storedViewType === this.defaultViewType) {
            // For search pages, we still need to ensure the correct template is loaded
            if (isSearchPage && storedViewType) {
                console.log('Search page: applying stored view type even though it matches default:', storedViewType);
                this.getCategoryPage(storedViewType);
                return;
            }
            return this.addToggleEvents();
        }

        // Only switch to stored view if it's different from default
        console.log('Switching to stored view type:', storedViewType);
        this.getCategoryPage(storedViewType);
    }
}
