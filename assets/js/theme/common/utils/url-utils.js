import Url from 'url';

const urlUtils = {
    // List of tracking parameters that should be preserved during URL manipulation
    trackingParams: [
        'gclid',      // Google Ads Click ID
        'gclsrc',     // Google Ads source
        'dclid',      // Display & Video 360 Click ID
        'fbclid',     // Facebook Click ID
        'msclkid',    // Microsoft Advertising Click ID
        'ttclid',     // TikTok Click ID
        'twclid',     // Twitter Click ID
        'utm_source', // UTM source
        'utm_medium', // UTM medium
        'utm_campaign', // UTM campaign
        'utm_term',   // UTM term
        'utm_content' // UTM content
    ],

    // Preserve tracking parameters from current URL when building new query strings
    preserveTrackingParams: (newQueryParams = {}) => {
        const currentUrl = Url.parse(window.location.href, true);
        const preservedParams = {};
        
        // Copy tracking parameters from current URL
        urlUtils.trackingParams.forEach(param => {
            if (currentUrl.query[param]) {
                preservedParams[param] = currentUrl.query[param];
            }
        });
        
        // Merge with new parameters (new parameters take precedence)
        return Object.assign(preservedParams, newQueryParams);
    },
    getUrl: () => `${window.location.pathname}${window.location.search}`,

    goToUrl: (url) => {
        window.history.pushState({}, document.title, url);
        $(window).trigger('statechange');
    },

    replaceParams: (url, params) => {
        const parsed = Url.parse(url, true);
        let param;

        // Let the formatter use the query object to build the new url
        parsed.search = null;

        for (param in params) {
            if (params.hasOwnProperty(param)) {
                parsed.query[param] = params[param];
            }
        }

        return Url.format(parsed);
    },

    buildQueryString: (queryData) => {
        let out = '';
        let key;
        for (key in queryData) {
            if (queryData.hasOwnProperty(key)) {
                // Skip empty values to prevent invalid URLs
                if (queryData[key] === null || queryData[key] === undefined || queryData[key] === '') {
                    continue;
                }
                
                if (Array.isArray(queryData[key])) {
                    let ndx;

                    for (ndx in queryData[key]) {
                        if (queryData[key].hasOwnProperty(ndx)) {
                            const value = queryData[key][ndx];
                            if (value !== null && value !== undefined && value !== '') {
                                out += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                            }
                        }
                    }
                } else {
                    out += `&${encodeURIComponent(key)}=${encodeURIComponent(queryData[key])}`;
                }
            }
        }

        return out.substring(1);
    },

    parseQueryParams: (queryData) => {
        const params = {};

        for (let i = 0; i < queryData.length; i++) {
            const temp = queryData[i].split('=');

            if (temp[0] in params) {
                if (Array.isArray(params[temp[0]])) {
                    params[temp[0]].push(temp[1]);
                } else {
                    params[temp[0]] = [params[temp[0]], temp[1]];
                }
            } else {
                params[temp[0]] = temp[1];
            }
        }

        return params;
    },
};

export default urlUtils;
