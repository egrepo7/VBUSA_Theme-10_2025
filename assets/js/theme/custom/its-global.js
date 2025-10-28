import kitchenSink from './kitchen-sink';
import imageSwapOnHover from './image-swap-on-hover';
import popupLoginWindow from './popup-login';
import CardAddToCart from './card-add-to-cart';
import scrollHeader from './scroll-header';
import _ from 'lodash';
// import '../lazysizes/plugins/unveilhooks/ls.unveilhooks';
import '../../../../node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks';

// https://fslightbox.com/javascript/documentation/how-to-use
require("fslightbox");

export default function (context) {
    const { inDevelopment } = context;
    
    // Initialize scroll header globally
    const headerScrollSystem = scrollHeader();
    if (headerScrollSystem) {
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            headerScrollSystem.init();
        }, 100);
    }
    
    if (inDevelopment) {
        // console.log('this.context ', context); // eslint-disable-line

        kitchenSink(context);
    }

    imageSwapOnHover(context);
    popupLoginWindow(context);
    new CardAddToCart(context); // eslint-disable-line
    if (context.template === 'pages/blog') {
        $(window).resize(() => {
            if (window.innerWidth < 1340) {
                $('.blog-sidebar').prependTo('.blog-top__content');
            } else {
                $('.blog-sidebar').prependTo('.page--blog-custom');
            }
        });

        if (window.innerWidth < 1340) {
            $('.blog-sidebar').prependTo('.blog-top__content');
        }
    }
    if (context.template === 'pages/blog-post') {
        // console.log('blog post');
        $(window).resize(() => {
            if (window.innerWidth < 1340) {
                $('.blog-sidebar').appendTo('.blog-post__header');
            } else {
                $('.blog-sidebar').appendTo('.page--blog-post-custom');
            }
        });

        if (window.innerWidth < 1340) {
            $('.blog-sidebar').appendTo('.blog-post__header');
        }
    }

    $('.navPage-subMenu-action').on('click', (event) => {
        $('.navPage-subMenu-action__wrapper').toArray().forEach((wrapper) => {
            const $wrapper = $(wrapper);
            const $nextWrapper = $(event.currentTarget)
                .parent()
                .next()
                .find('.navPage-subMenu-action__wrapper');
            if ($wrapper.is($nextWrapper)) {
                const $childList = $(event.currentTarget).parent().find('.navPage-childList.is-open');
                if (!$childList.hasClass('is-open')) {
                    $nextWrapper.removeClass('child-open');
                } else {
                    $nextWrapper.addClass('child-open');
                }
            } else {
                $nextWrapper.removeClass('child-open');
            }
        });
    });


    // close the container each time a new <li> is hovered
    $('[data-mega-menu-toggle]').on('mouseover', (event) => {
        $('.navPage-megaMenu-list').removeClass('is-open');
    });

    $('[data-mega-menu-toggle].has-submenu').on('mouseenter', (event) => {
        $('[data-mega-menu-item]').removeClass('is-open');
    });

    $('[data-mega-menu-toggle].has-submenu').on('mouseover', (event) => {
        $('.navPage-megaMenu-list').addClass('is-open');
        const $menu = $(event.target).parents('[data-mega-menu-toggle]').attr('data-mega-menu-toggle');
        $(`[data-mega-menu-item='${$menu}']`).addClass('is-open');
    });
}

