import _ from 'lodash';
// TODO: Remove JS and convert to css
export default function imageSwapOnHover(context) {
    const isActive = typeof context === 'object' ? context.itsConfig.image_swap_on_hover : context;

    if (!isActive) return;

    function swapImage() {
        const image = $(this).find('.card-image, .listItem-image');
        const imageContainer = $(this).find('[data-image-swap-src]');
        let altImageSrc = imageContainer.attr('data-image-swap-src');

        // Clear srcset because we don't have access to the the second images srcset
        image.attr('srcset', '');

        if (altImageSrc.length) {
            altImageSrc = altImageSrc.includes('{:size}') ? altImageSrc.replace('{:size}', '500x500') : altImageSrc;
            imageContainer.attr('data-image-swap-src', image.attr('src'));
            image.attr('src', altImageSrc);
        }
    }

    const gridImages = '[data-image-swap-link]';
    const slickImages = '[data-image-swap-link]';


    $(`${gridImages}, ${slickImages}`).off('mouseenter mouseleave focus blur', _.debounce(swapImage, 500));
    $(`${gridImages}, ${slickImages}`).on('mouseenter mouseleave focus blur', _.debounce(swapImage, 500));

    // Re-apply binds for image swap on hover after AJAX
    $('body').on('facetedSearchRefresh productViewModeChanged', () => {
        $(`${gridImages}, ${slickImages}`).off('mouseenter mouseleave focus blur', _.debounce(swapImage, 500));
        $(`${gridImages}, ${slickImages}`).on('mouseenter mouseleave focus blur', _.debounce(swapImage, 500));
    });
}
