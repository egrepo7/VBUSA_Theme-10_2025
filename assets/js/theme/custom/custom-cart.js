import mediaQueryListFactory from '../common/media-query-list';

const floatingCheckoutButton = () => {
    const $summaryContainer = $('.js-cart__totals');
    const $floatingButton = $('.floating-checkout-button');
    const mq = mediaQueryListFactory('medium');

    function WidthChange(mq) {
        const fadeTiming = 400;

        if (!mq.matches) {
            const initWindowPosition = window.scrollY + window.innerHeight;

            if (initWindowPosition < $summaryContainer.offset().top) {
                $floatingButton.show();
            } else {
                $floatingButton.hide();
            }

            $(window).on('scroll', () => {
                const bottomWindowPosition = window.scrollY + window.innerHeight;

                if (bottomWindowPosition < $summaryContainer.offset().top) {
                    $floatingButton.fadeIn(fadeTiming);
                } else {
                    $floatingButton.fadeOut(fadeTiming);
                }
            });
        } else {
            $floatingButton.hide();
        }
    }

    mq.addListener(WidthChange);
    WidthChange(mq);

    $floatingButton.on('click', () => {
        const goToCheckout = false; // Set to true if the button should go to checkout instead of scrolling the user down the page
        const totalsOffset = $summaryContainer.offset().top;

        if (goToCheckout) {
            window.location.href = '/checkout.php';
        } else {
            $('html, body').animate({ scrollTop: totalsOffset - 100 }, 700); // scroll user to the real checkout button product
        }
    });
};

export { floatingCheckoutButton };
