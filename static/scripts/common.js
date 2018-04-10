    // Это вставка картинки в canvas и отрисовка ее на нем
    // var imWidth = zoomImage.width();
    // var scale = imWidth / im.width;
    // var canv = document.createElement('canvas');
    // canv.width = imWidth;
    // canv.height = im.height * scale;
    // var canvContext = canv.getContext('2d');
    // canvContext.drawImage(im, 0, 0, parseInt(canv.width), parseInt(canv.height));
    // im.src = canv.toDataURL();


function set_menu_item(menu_items) {
    var pathname = document.location.pathname;
    menu_items.each(
        function(i, e) {
            e = $(e);
            var link = e.find('a');
            if (pathname.match(link.attr('href')) != null) {
                if (pathname == link.attr('href')) {
                    e.addClass('active').siblings().removeClass('active');
                    return false;
                } else {
                    e.addClass('active');
                }
            }
        }
    );
}

function preloadImages(images, callback) {
    var counter = 0;
    for (var i = 0; i < images.length; i++) {
        var img  = new Image();
        img.onload = function() {
            counter++;
            if (counter == images.length) {
                callback();
            }
        }
        img.src = images[i];
    }
}

function loadImages(collection) {
    'use strict';
    
    var bgRe = /url\((?:\'|\")?([^'"]+)(?:\'|\")?\)/,
        doc = $(document),
        imagesAll = $.apply($, arguments)
        .map(function() {
                var src,
                    match;
                if (this instanceof HTMLImageElement) {
                    src = this.src;
                } else {
                    match = $(this).css('backgroundImage').match(bgRe);
                    if (!match) return null;
                    src = match[1];
                };
                return src;
            }
        ).get(),
        images = [],
        len;
    imagesAll.forEach(function(src) {
            if (!src || (images.indexOf(src) > -1)) return;
            images.push(src);
        }
    );
    len = images.length;

    images.forEach(function(src, idx) {
            var img = new Image();
            img.onload = function() {
                doc.trigger('imgloaded', [idx, len]);
                img.onload = null;
            };
            img.src = src;
        }
    );
};

function getScrollbarWidth() {
   var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.overflowY = 'scroll';
    div.style.width =  '200px';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    var scrollWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollWidth;
}

function separatePlaces(num, separator) {
    var numStr = String(num);
    separator = separator || ' ';
    numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return numStr;
};


// Показ и скрытие прелоадера
// Скрытие само прогоняет его в конец

function showPreloader(preloader) {
    preloader.css('width', 0).parent().show().css('opacity', '1');
}

function hidePreloader(preloader) {
    preloader.stop(true, false).animate({
        'width': '100%'
    }, 300, 'linear', function() {
        preloader.parent().stop(true, false).animate({
            'opacity':0
        }, 500, function() {$(this).hide()});
    });
}


$(document).ready(function() {
    // пока ничего не загрузилось, не показываем контент
    var contentWrapper =  $('.js-loaded_wrapper');
    // contentWrapper.css('opacity', 0);

    $(window).load(function() {
        contentWrapper.animate({'opacity': 1}, 800);
    });


    set_menu_item($('.navigation_item'));


    var pagePreloader = $('.page_preloader');
    var imagesLoaded = 0;
    $(document).on('imgloaded', function(ev, imIndex, imCount) {
        imagesLoaded += 1;
        var preloadDelta = imCount + 1;
        newPreloaderWidth = imagesLoaded * 100 / imCount
        pagePreloader.stop(true, false).animate({
        // pagePreloader.animate({
            'width': newPreloaderWidth + '%'
        }, 200, 'linear');

        $(window).load(function() {
            $(document).off('imgloaded');
            pagePreloader.stop(true, false).animate({
            // pagePreloader.animate({
                'width': '100%'
            }, 400, 'linear',function() {
                pagePreloader.parent().animate({
                    'opacity': 0
                }, 500, function() {$(this).hide()});
            });
        })
    });

    loadImages('*');



    // Ховер на категории каталога
    $('.index_house_types').on('mouseenter', '.index_house_type-name_link', function() {
        var this_ = $(this);
        this_.closest('.index_house_type').siblings().find('.index_house_type-name_link').animate(
            // {'color': 'rgba(0,0,0,0.5)'},
            {'opacity': '0.5'},
            200
        );
        this_.addClass('hovered');
    });

    $('.index_house_types').on('mouseleave', '.index_house_type-name_link', function() {
        var this_ = $(this);
        this_.removeClass('hovered');
        this_.closest('.index_house_type').siblings().find('.index_house_type-name_link').stop(true, false).animate(
            // {'color': 'rgba(0,0,0,1)'},
            {'opacity': '1'},
            200
        );
    });
});
