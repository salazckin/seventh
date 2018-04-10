$(document).ready(function() {

    var bigImagesWrapper = $('.gallery_big_images_wrapper');
    var resizedBlock = bigImagesWrapper.find('.gallery_big_images');
    var resizedBlockProportion = resizedBlock.height() /resizedBlock.width();
    var resImagesContainer = resizedBlock.children('.js-selected-images-container');


    function resizeBigImageWrapper() {
        var windowHeight = $(window).height();
        var oldHeight = resizedBlock.height();
        var imagesItems = resizedBlock.find('.js-selected-image');
        var newHeight;

        // ограничим диапазоны изменения размеров попапа
        if (windowHeight < 770 && windowHeight > 500) {
            newHeight = windowHeight - 60;
        } else if (windowHeight >= 770) {
            newHeight = 710
        } else if (windowHeight <= 500) {
            newHeight = 440
        }

        resizedBlock.height(newHeight);
        resizedBlock.width(Math.ceil(resizedBlock.height() / resizedBlockProportion));
        imagesItems.css({
            'width': resImagesContainer.width(),
            'height': resImagesContainer.height()
        });

        imagesItems.each(function(i, e) {
            var item = $(e);
            var img = item.find('img')
            img.css({
                'marginTop': (item.height() - img.height()) / 2
            })
        });

        var selectedItem = resizedBlock.find('.js_select-images_switch.active');
        selectImage(selectedItem, false)
    }

    resizeBigImageWrapper();

    $(window).resize(function() {
        resizeBigImageWrapper();
    })

    // Функция выбора картинки
    // меняет картинку прокручиванием
    function selectImage(item, withAnimation) {
        var selectAnmTime = 400;
        item.addClass('active').siblings().removeClass('active');
        var i = item.index();
        var imagesContainer = item.closest('.js-images-selector-wrapper').find('.js-selected-images-container');
        var imagesItems = imagesContainer.find('.js-selected-image');
        var scrollStep = imagesItems.width();
        if (withAnimation) {
            imagesContainer.stop(true, false).animate(
                {'scrollLeft': scrollStep * i},
                selectAnmTime
            );
        } else {
            imagesContainer.stop(true, false).scrollLeft(scrollStep * i)
        }
        
    }

    $('.gallery_items').on('click', '.js_select-images_switch', function() {
        selectImage($(this), true);
    });


    // Показ и скрытие большого попапа для просмотра картинок
    var imagesItems = bigImagesWrapper.find('.gallery_big_images_items');
    var imagesSwitcher = bigImagesWrapper.find('.index_special_items_switcher_buttons');
    var bigImAnmTime = 300

    function showBigImagesWrapper() {
        bigImagesWrapper.removeClass('hidden').animate(
            {'opacity': 1},
            bigImAnmTime
        );
    }

    function hideBigImagesWrapper() {
        bigImagesWrapper.animate(
            {'opacity': 0},
            bigImAnmTime,
            function() {
                bigImagesWrapper.addClass('hidden');
            }
        );
    }

    // Показ попупа
    $('.gallery_items').on('click', '.gallery_item_image', function() {
        var this_ = $(this);
        var parent = this_.parent();
        var currentImageIndex = this_.index();
        var images = [];
        // Вынимаем картинки из дата-атрибутов и прелоадим их, а потом уже показываем попуп
        parent.children().each(function(i, e) {
            e = $(e);
            images.push(e.data('bigImage'));
        });
        preloadImages(images, function() {
            imagesItems.html('');
            imagesSwitcher.html('');
            for (var i = 0; i < images.length; i++) {
                imagesItems.append(
                    '<li class="gallery_big_image_item js-selected-image">' +
                        '<img src="'+ images[i] +'"">' +
                    '</li>'
                );
                var itemNum = i + 1;
                imagesSwitcher.append(
                    '<li class="index_special_items_switcher_button js_select-images_switch">' + 
                    itemNum.toString() + 
                    '</li>'
                );
            }
            showBigImagesWrapper();
            resizeBigImageWrapper();
            // Показ текущей картинки
            imagesItemsContainer = imagesItems.parent();
            imagesItemsContainer.scrollLeft(imagesItemsContainer.width() * currentImageIndex);
            imagesSwitcher.children().slice(currentImageIndex, currentImageIndex + 1).addClass('active');
        })
    });

    // Закрытие попупа
    bigImagesWrapper.on('click', '.gallery_big_images_close', function() {
        hideBigImagesWrapper();
    });

    // Перключалка картинок в попупе по кнопочкам с номерами
    bigImagesWrapper.on('click', '.js_select-images_switch', function() {
        selectImage($(this), true);
    });

    // Переключалка картинок в попупе по стрелочкам
    // Определяет, какая кнопочка с номером активна и переключает на предыдущую или следующую
    bigImagesWrapper.on('click', '.js_select-images_switch_arrow', function() {
        var arrow = $(this);
        var currentItem = bigImagesWrapper.find('.js_select-images_switch.active');
        var newItem;
        if (arrow.hasClass('next')) {
            newItem = currentItem.next();
        } else {
            newItem = currentItem.prev();
        }
        selectImage(newItem, true);
    });

    
})
