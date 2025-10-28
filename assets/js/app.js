__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line

import Global from './theme/global';
import clientsFilter from './theme/custom/clients-filter';
import './theme/custom/scroll-animations';
import './theme/custom/we-serve-section';
import './theme/custom/mobile-search'; // Mobile search functionality
import ClientsSectionTracker from './theme/custom/clients-section-tracker';
import AboutUsGallery from './theme/custom/about-gallery';

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: () => import('./theme/blog'),
    blog_post: () => import('./theme/blog'),
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

const customClasses = {};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    return {
        load() {
            $(() => {
                // Load globals
                if (loadGlobal) {
                    Global.load(context);
                }

                const importPromises = [];

                // Find the appropriate page loader based on pageType
                const pageClassImporter = pageClasses[pageType];
                if (typeof pageClassImporter === 'function') {
                    importPromises.push(pageClassImporter());
                }

                // See if there is a page class default for a custom template
                const customTemplateImporter = customClasses[context.template];
                if (typeof customTemplateImporter === 'function') {
                    importPromises.push(customTemplateImporter());
                }

                // Wait for imports to resolve, then call load() on them
                Promise.all(importPromises).then(imports => {
                    imports.forEach(imported => {
                        imported.default.load(context);
                    });
                });
            });
        },
    };
};

// Initialize on page load
$(document).ready(() => {
    clientsFilter();
    
    // Initialize clients section tracker for header control
    new ClientsSectionTracker();
    
    // Initialize about page gallery if on about page
    if ($('.about-trusted__img, .about-designed__img, .about-mission__img, .about-service__img').length > 0) {
        const aboutGallery = new AboutUsGallery();
        
        // Make available globally for debugging
        window.aboutGallery = aboutGallery;
        
        console.log('About page gallery initialized');
    }

    // Category hero scroll arrow functionality
    $('.category-hero__scroll-btn').on('click', function(e) {
        e.preventDefault();
        
        // Find the next section after the hero
        const nextSection = $('.category-grid, .category__content-container, [name="category_below_content"]').first();
        
        if (nextSection.length) {
            $('html, body').animate({
                scrollTop: nextSection.offset().top - 20 // Small offset from top
            }, 800, 'easeInOutQuart');
        } else {
            // Fallback: scroll down by viewport height
            $('html, body').animate({
                scrollTop: $(window).height()
            }, 800, 'easeInOutQuart');
        }
    });
});
