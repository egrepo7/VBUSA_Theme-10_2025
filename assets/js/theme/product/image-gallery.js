$(document).ready(function() {
    function initMainImageSlick() {
        if (window.innerWidth > 768) return;
        if (typeof $.fn.slick !== 'function') return;
        if (!window.BCData || !window.BCData.product_images || !window.BCData.product_images.length) return;

        var $mainImageDesktop = $('.main-image-desktop');
        if (!$mainImageDesktop.length) return;
        if ($('.main-image-slick').length) return;

        var images = window.BCData.product_images;
        var $slick = $('<div class="main-image-slick"></div>');
        
        // Add CLS prevention attributes
        $slick.css({
            'min-height': '300px',
            'background': 'white',
            'aspect-ratio': '1/1',
            'border-radius': '12px',
            'margin-bottom': '1rem'
        });
        images.forEach(function(img) {
            var $slide = $('<div></div>');
            var $figure = $('<figure class="productView-image" data-image-gallery-main></figure>');
            var $container = $('<div class="productView-img-container"></div>');
            
            // Add CLS prevention
            $figure.css({
                'aspect-ratio': '1/1',
                'min-height': '300px',
                'background': 'white'
            });
            $container.css({
                'min-height': '300px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'background': 'white'
            });
            var $a = $('<a></a>')
                .attr('href', img.url_zoom)
                .attr('data-type', 'image')
                .attr('target', '_blank');
            var $img = $('<img>')
                .attr('src', img.url_zoom)
                .attr('alt', img.alt || '')
                .attr('loading', 'eager')
                .attr('fetchpriority', 'high')
                .css({
                    'width': '100%',
                    'height': '100%',
                    'object-fit': 'contain'
                });
            $a.append($img);
            $container.append($a);
            $figure.append($container);
            $slide.append($figure);
            $slick.append($slide);
        });
        $mainImageDesktop.after($slick);
        $slick.slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true
        });
    }

    let tries = 0;
    const maxTries = 10;
    const interval = setInterval(function() {
        tries++;
        initMainImageSlick();
        if ($('.main-image-slick').length || tries >= maxTries) {
            clearInterval(interval);
        }
    }, 200);
});
