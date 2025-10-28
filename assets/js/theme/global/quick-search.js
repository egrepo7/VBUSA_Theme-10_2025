import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';
import urlUtils from '../common/utils/url-utils';
import mediaQueryListFactory from '../common/media-query-list';

export default function () {
    const TOP_STYLING = 'top: 49px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchForms = $('[data-quick-search-form]');
    const $quickSearchExpand = $('#quick-search-expand');
    const $searchQuery = $quickSearchForms.find('[data-search-quick]');
    const stencilDropDownExtendables = {
        hide: () => {
            $quickSearchExpand.attr('aria-expanded', false);
            $searchQuery.trigger('blur');
        },
        show: (event) => {
            $quickSearchExpand.attr('aria-expanded', true);
            $searchQuery.trigger('focus');
            event.stopPropagation();
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $('#quickSearch'), TOP_STYLING);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if ($(e.target).closest('[data-prevent-quick-search-close], .modal-background').length === 0) {
            stencilDropDown.hide($container);
        }
    };

    // Hide search results initially and when search is cleared
    $quickSearchResults.hide();
    
    // Hide search results when search input loses focus and is empty
    $searchQuery.on('blur', function() {
        const searchValue = $(this).val();
        if (!searchValue || searchValue.length === 0) {
            $quickSearchResults.hide();
        }
    });

    // Hide search results when search input is cleared
    $searchQuery.on('input', function() {
        const searchValue = $(this).val();
        if (!searchValue || searchValue.length === 0) {
            $quickSearchResults.hide();
        }
    });

    // stagger searching for 1200ms after last input
    const debounceWaitTime = 1200;
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }

            $quickSearchResults.html(response);
            const $quickSearchResultsCurrent = $quickSearchResults.filter(':visible');

            const $noResultsMessage = $quickSearchResultsCurrent.find('.quickSearchMessage');
            if ($noResultsMessage.length) {
                $noResultsMessage.attr({
                    role: 'status',
                    'aria-live': 'polite',
                });
            } else {
                const $quickSearchAriaMessage = $quickSearchResultsCurrent.next();
                $quickSearchAriaMessage.addClass('u-hidden');

                const predefinedText = $quickSearchAriaMessage.data('search-aria-message-predefined-text');
                const itemsFoundCount = $quickSearchResultsCurrent.find('.product').length;

                $quickSearchAriaMessage.text(`${itemsFoundCount} ${predefinedText} ${searchQuery}`);

                setTimeout(() => {
                    $quickSearchAriaMessage.removeClass('u-hidden');
                }, 100);
            }
            // Header-2 - Close Search Results
            const toggleSearch = () => {
                $quickSearchResults.show();

                $('.quickSearchResults .modal-close').on('click', () => {
                    $quickSearchResults.hide();
                });
            };
            if (mediaQueryListFactory('medium')) {
                toggleSearch();
            }
            $(window).on('resize', () => {
                if (mediaQueryListFactory('medium')) {
                    $quickSearchResults.empty();
                    toggleSearch();
                }
            });

        });
    }, debounceWaitTime);

    utils.hooks.on('search-quick', (event, currentTarget) => {
        const searchQuery = $(currentTarget).val();

        // Hide search results if input is empty
        if (searchQuery.length === 0) {
            $quickSearchResults.hide();
            return;
        }

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            $quickSearchResults.hide();
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search forms
    $quickSearchForms.on('submit', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const searchQuery = $target.find('input').val();
        const searchUrl = $target.data('url');

        if (searchQuery.length === 0) {
            return;
        }

        urlUtils.goToUrl(`${searchUrl}?search_query=${searchQuery}`);
        window.location.reload();
    });
}
