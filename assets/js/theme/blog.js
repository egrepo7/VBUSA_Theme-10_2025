import PageManager from './page-manager';
import utils from '@bigcommerce/stencil-utils';
import collapsibleFactory from './common/collapsible';

export default class Blog extends PageManager {
    onReady() {
        collapsibleFactory();

        this.fetchRecentPosts();
    }

    fetchRecentPosts() {
        const $sidebarRecent = $('#blog-sidebar-recent');

        if (!$sidebarRecent.length) return;

        const requestOptions = {
            config: {
                blog: {
                    recent_posts: {
                        limit: 5,
                    },
                },
            },
            template: 'custom/blog/blog-recent-post-items',
        };

        utils.api.getPage('/', requestOptions, (err, res) => {
            $sidebarRecent.html(res);
        });
    }
}
