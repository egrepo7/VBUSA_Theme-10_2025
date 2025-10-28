import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import adminBar from './global/adminBar';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';
import collapsibleFactory from './common/collapsible';

import customGlobal from './custom/its-global';

export default class Global extends PageManager {
    onReady() {
        // Add sticky header class to body and make header sticky
        this.initStickyHeader();
        
        const {
            channelId,
            cartId,
            productId,
            categoryId,
            secureBaseUrl,
            maintenanceModeSettings,
            adminBarLanguage,
        } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        adminBar(secureBaseUrl, channelId, maintenanceModeSettings, JSON.parse(adminBarLanguage), productId, categoryId);
        loadingProgressBar();
        svgInjector();

        customGlobal(this.context);

        // Init collapsible
        collapsibleFactory();
    }

    initStickyHeader() {
        // Add sticky header class to body
        document.body.classList.add('has-sticky-header');
        
        const updateHeaderHeight = () => {
            // Find the header element
            const header = document.querySelector('.header.header-2');
            const banners = document.querySelector('.banners[data-banner-location="top"]');
            
            if (header) {
                // Calculate total height including banners
                let totalHeight = 0;
                
                if (banners) {
                    totalHeight += banners.offsetHeight;
                }
                totalHeight += header.offsetHeight;
                
                // Set dynamic padding based on actual header height
                document.documentElement.style.setProperty('--header-height', `${totalHeight}px`);
                document.body.style.paddingTop = `${totalHeight}px`;
                
                // Make header sticky
                header.style.position = 'fixed';
                header.style.top = banners ? `${banners.offsetHeight}px` : '0';
                header.style.left = '0';
                header.style.right = '0';
                header.style.zIndex = '1000';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.webkitBackdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                header.style.transition = 'all 0.3s ease';
                
                // Make banners sticky too if they exist
                if (banners) {
                    banners.style.position = 'fixed';
                    banners.style.top = '0';
                    banners.style.left = '0';
                    banners.style.right = '0';
                    banners.style.zIndex = '1001';
                    banners.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    banners.style.backdropFilter = 'blur(10px)';
                    banners.style.webkitBackdropFilter = 'blur(10px)';
                }
            }
        };
        
        // Initial setup
        updateHeaderHeight();
        
        // Update on window resize
        window.addEventListener('resize', updateHeaderHeight);
        
        // Also update after a short delay in case content loads dynamically
        setTimeout(updateHeaderHeight, 100);
    }
}
