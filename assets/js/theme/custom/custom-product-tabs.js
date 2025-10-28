export default function ($scope) {
    const tabTitle = $('div[data-its-tab-title]');
    const tabText = $('div[data-its-tab-text]');

    tabTitle.each((i, title) => {
        $('.tabs', $scope).append(`
            <li class="tab tab--custom" role="presentation">
            <a class="tab-title" href="#itsTab-${i}" aria-controls="itsTab-${i}" role="tab" tabindex="0" aria-selected="false">${$(title).text()}</a>
            </li>
        `);

        // remove the dummy title from the DOM / Description
        title.remove();
    });

    tabText.each((i, content) => {
        $('.tabs-contents', $scope).append(`
            <section class="tab-content tab-content--custom" id="itsTab-${i}" aria-hidden="true" role="tabpanel">
            ${content.innerHTML}
            </section>
        `);

        // remove the dummy content from the DOM / Description
        content.remove();
    });
}
