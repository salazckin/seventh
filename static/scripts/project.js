projectList = [];
currentProject = null;

function getProject_(projectId, callback) {
    $.get(
        ''+ projectId +'/index.json'
    ).success(function(data) {
        callback(data);
    });
}


function setCursor(e) {
    e.css({
        'cursor': 'pointer',
        'cursor': 'zoom-in',
        'cursor': 'url("https://salazckin.github.io/seventh/static/images/plus_hover.png") 27 23, pointer'
    });
}

$(document).ready(function() {

    var bodyWidth = $('body').width();
    var pagePreloader = $('.page_preloader');
    var projectWrapper = $('.js-project_wrapper');
    var projectSelectButtons = $('.project_page_select-project')
    var exteriorImagesWrapper = $('.js-exterior-images-wrapper');
    var interiorImagesWrapper = $('.js-interior-images-wrapper');
    var projectTexts = {
        'size': $('.project_size_value'),
        'price': $('.project_page_price-value'),
        'square': $('.project_page_square_value')
    }
    var projectHeader = $('.project_page_header-content');

    // заполянем список текущим проектом
    getProject_(projectId, function(data) {
        projectList.push(data);
        currentProject = projectList[0];
        projectWrapper.trigger('project_loaded');
    });

    // Переделка якоря в адрес

    var windowHash = window.location.hash.substring(1);
    if (windowHash) {
        window.location.href = '/projects/'+ windowHash + '/'
    }


    // projectWrapper.on('big_images_loaded', function() {
    //     var neighbours = ['prev', 'next'];
    //     for (var i = 0; i < neighbours.length; i++) {
    //         var n = currentProject[neighbours[i]];
    //         var callback;
    //         if (n) {
    //             if (i == 0) {
    //                 callback = function(data) {projectList.unshift(data);}
    //             } else {
    //                 callback = function(data) {
    //                     projectList.push(data);
    //                     // Здесь надо вызывать функцию, которая запрелоадит картинки этих двух проектов
    //                     // и затриггерит событие, что они загружены
    //                     // Функция залоадивает все картинки, кроме больших.
    //                     // Прелоад больших картинок надо как-то потом вызывать еще при переключении на другой проект
    //                     projectWrapper.on('neig')
    //                 }
    //             }
    //             getProject(n, callback);
    //         }
    //     }
    // });

    // Переключалка проектов 

    function showNewProjectImages(images, container, positionClass, anmTime) {
        setCursor($('.project_description_image-item'));
        images.addClass(positionClass);
        container.append(images)
        var prevImages = images.prev();
        // Анимации, ресайзящие новый блок.
        images.children().css({
            'width': container.width(),
            'height': container.height(),
        })
        images.find('.project_description_images').css({
            'width': container.width() * 1.2,
            'height': container.height() * 1.2,
            'marginLeft': -container.width() * 0.1,
            'marginTop': -container.height() * 0.2
        });
         images.find('.project_description_images').animate(
            {
                'width': container.width(),
                'height': container.height(),
                'marginLeft': 0,
                'marginTop': 0
            },
            anmTime
        );
        // Анимация, показывающая фотки нового проекта
        images.animate(
            {
                'height': '100%',
                'width': '100%'
            },
            anmTime,
            // 'easeInOutQuad',
            'easeInOutCirc',
            function() {
                prevImages.remove();
                images.children().css({
                    'width': '',
                    'height': ''
                });
            }
        );
    }

    function showNewProjectTexts(project, anmTime) {
        project.size = project.name;
        project['price'] = project.prices[0];
        for (text in projectTexts) {
            var t = projectTexts[text];
            // Родитель - чтобы не было видно, как скачут надписи
            var parent = t.parent();
            parent.data('child', t);
            t.data('field', text);
            parent.animate(
                {'opacity': 0},
                anmTime * 0.5,
                'easeOutQuad',
                function() {
                    // Изгорода с data-атрибутами, потому что все коллбэки выполняются после окончания цикла
                    var parent = $(this);
                    var t = parent.data('child');
                    t.text(project[t.data('field')]);
                    parent.animate(
                        {'opacity': 1},
                        anmTime * 0.5,
                        'easeInQuad'
                    );
                }
            );
        }
    }

    function showNewProjectData(project) {
        var anmTime = 600;
        // Создаем новые картинки и анимируем блоки с ними
        var newExtImages = $("<li class='project_images_item'>" + project.exterior_html + "</li>");
        var newIntImages = $("<li class='project_images_item'>" + project.interior_html + "</li>");
        showNewProjectImages(newExtImages, exteriorImagesWrapper, 'in_top', anmTime);
        showNewProjectImages(newIntImages, interiorImagesWrapper, 'in_left', anmTime+200);
        // заменяем тексты
        showNewProjectTexts(project, anmTime);
        // заменяем калькулятор
        var projectCalculator =  $('.project_calculator')
        projectCalculator.animate(
            {'opacity': 0},
            anmTime / 2,
            function() {
                projectCalculator.html(project['calculator']).animate(
                    {'opacity': 1},
                    anmTime / 2,
                    function() {
                        fixPriceWrapper();
                        if (project['calculator_type'] == 'presets') {
                            setComplectation(projectWrapper);
                        }
                    }
                )
            }
        );
        
    }

    function preloadProjectImages(project) {
        var counter = 0;
        var images = [];
        // Здесь загружать только первые
        var imgList = project.interior_images.slice(0, 1).concat(project.exterior_images.slice(0, 1));
        for (var i = 0; i< imgList.length; i++) {
            // images.push('/' + imgList[i]['image_small']);
            images.push('http://domcom.redis.tv/' + imgList[i]['image_small']);
            // images.push('/' + imgList[i]['image_big']);
            images.push('/seventh/' + imgList[i]['thumbnail']);
        }
        for (var i = 0; i < images.length; i++) {
            var img  = new Image();
            img.onload = function() {
                counter++;
                if (counter == images.length) {
                    showNewProjectData(project);
                    pagePreloader.animate({
                        'width': '100%'
                    }, 300, 'linear', function() {
                        pagePreloader.parent().stop(true, false).animate({
                            'opacity':0
                        }, 500, function() {$(this).hide()});
                    });
                    preloadOtherImages(project);

                    
                } else {
                    var newDelta = (counter)*100/images.length;
                    pagePreloader.stop(true, false).animate({
                        'width': newDelta + '%'
                    }, 300, 'linear');
                }

            }
            img.src = images[i];
        }
    }

    function getProject(project_id, callback) {
        pagePreloader.parent().show().css('opacity', '')
        pagePreloader.css('width', '').animate({
            'width': '13%'
        }, 4000, 'linear');
        $.get(
            ''+ project_id +'/index.json'
        ).success(function(data) {
            // projectList.push(data);
            projectList[0] = data;
            currentProject = projectList[0]
            projectSelectButtons.slice(0, 1).data('projectId', data['prev']);
            projectSelectButtons.slice(1, 2).data('projectId', data['next']);
            // Скрытие кнопочек на границах
            projectSelectButtons.each(function(i, e) {
                e = $(e);
                if (e.data('projectId')) {
                    e.removeClass('hidden').css('display', 'block').animate(
                        {'opacity': 1},
                        200
                    );
                } else {
                    e.animate(
                        {'opacity': 0},
                        200,
                        function() {
                            e.hide();
                        }
                    );
                }
            })
            callback(data);
        });
    }

    projectWrapper.on('click', '.project_page_select-project', function() {
        var this_ = $(this);
        var arrowData = this_.data();
        var newProjectId = arrowData['projectId'];
        window.location.hash = '#' + newProjectId;
        // if ( !newProject ) {
            // console.log(newProjectId);
            getProject(newProjectId, preloadProjectImages);
        // }
    }) ;

    var arrTimeout;
    projectWrapper.on('mouseenter', '.project_page_select-project', function() {
        var this_ = $(this);
        clearTimeout(arrTimeout);
        this_.children().addClass('hovered');
    });

    projectWrapper.on('mouseleave', '.project_page_select-project', function() {
        var this_ = $(this);
        arrTimeout = setTimeout(function() {
            this_.children().removeClass('hovered');
        }, 250)
    });

    // Показ картинок на весь экран

    var zoomContainer = $('.js-zoom-image-container');
    var zoomImage = $('.project_description_zoom_image')
    var zoomShowTime = 400;

    // 
    // Предазгрузка остальных маленьких картинок
    // 

    projectWrapper.on('small_project_images_loaded', function(ev, projectId) {
        console.log(projectId);
        if (currentProject.id == projectId) {
            currentProject.smallImagesLoaded = true;
        }
    });

    function preloadOtherImages(project) {
        var images = [];
        var projectId = project.id;
        var obj_images = project.interior_images.slice(1).concat(project.exterior_images.slice(1));
        for (var i = 0; i < obj_images.length; i++) {
            // images.push('/' + obj_images[i].image_small);
            images.push('http://domcom.redis.tv/' + obj_images[i].image_small);
        }
        preloadImages(images, function() {
            projectWrapper.trigger('small_project_images_loaded', [projectId]);
        });
    }

    $(window).load(function() {
        if (currentProject) {
            preloadOtherImages(currentProject);
        } else {
            projectWrapper.one('project_loaded', function() {
                preloadOtherImages(currentProject);
            });
        }
    });

    // 
    // Переключение маленьких картинок
    // 

    var selectorList = $('.js-images-selector-container');

    function showProjectImage(selectItem) {
        var selectAnmTime = 700;
        if (!selectItem.hasClass('active')) {
            selectItem.addClass('active').siblings().removeClass('active');
            var i = selectItem.index();
            var imType = selectItem.data('imageType');
            var imageUrl = getProjectImage(currentProject, imType, 'small', i);
            var imagesContainer = selectItem.closest('.js-images-selector-wrapper').find('.js-selected-images-container');
            var selectedImage = imagesContainer.children().slice(0, 1);

            selectedImage.stop(true, false).animate({
                'opacity': 0
            }, selectAnmTime / 2, function() {
                selectedImage.css('backgroundImage', 'url("' + imageUrl + '")').animate({
                    'opacity': 1
                }), selectAnmTime / 2;
            });

            // Подстановка в попуп.
            if (zoomImage.data('showed') == 'true') {
                showPreloader(pagePreloader);
                pagePreloader.animate({
                    'width': '65%'
                }, 700);
                var imageUrl = getProjectImage(currentProject, imType, 'big', i);
                var im = new Image();
                im.onload = function() {
                    zoomImage.stop(true, false).animate({
                        'opacity': 0
                    }, selectAnmTime * 0.7, 'easeOutCubic', function() {
                        zoomImage.html(im);
                        zoomImage.animate({
                            'opacity': 1
                        }, selectAnmTime * 0.7, 'easeInCubic');
                    });
                    hidePreloader(pagePreloader);
                }
                im.src = imageUrl;
            }
        }
    }

    projectWrapper.on('click', '.js-images-selector', function() {
        var selectedItem = $(this);
        if (currentProject.smallImagesLoaded) {
            showProjectImage(selectedItem);
        } else {
            console.log('images not loaded');
            showPreloader(pagePreloader);
            pagePreloader.animate({
                'windth': '40%'
            }, 9000);
            // Надо вызывать прелоад маленьких картинок при переключении дома
            // В прелоаде как-то запоминать, для какого проекта картинки грузятся
            projectWrapper.on('small_project_images_loaded', function() {
                console.log('trigger');
                hidePreloader(pagePreloader);
                showProjectImage(selectedItem);
                pagePreloader.off('small_project_images_loaded');
            });
        }
    });

    // old getBigImage
    function getProjectImage(project, imageType, imageSize, index) {
        // var imUrl = '/' + project[imageType + '_images'][index]['image_'+imageSize];
        var imUrl = 'http://domcom.redis.tv/' + project[imageType + '_images'][index]['image_'+imageSize];
        return imUrl;
    }

    // Перетаскивание зазумленной картинки
    function setMovingZoomImage(deltaX, deltaY, clientRect) {
        zoomImage.on('mousemove', function(e) {
            var sct = (e.clientY - clientRect.top) * deltaY;
            var scl = (e.clientX - clientRect.left) * deltaX;
            zoomImage.scrollTop(sct);
            zoomImage.scrollLeft(scl);
        });
    }
    function stopMovingZoomImage() {
        zoomImage.off('mousemove');
    }

    function createZoomImage(imageUrl) {
        var im = new Image()
        im.onload = function() {
            zoomImage.html(im);
        }
        im.src = imageUrl;
    }

    // Показ показ зазумленой картинки. 
    projectWrapper.on('click', '.js-selected-image', function(e) {
         $('html, body').animate(
            {'scrollTop': 0},
            500
        );
        showPreloader(pagePreloader);
        pagePreloader.animate({
            'width': '67%'
        }, 9000);
        var image = $(this);
        var index = image.closest('.project_images_container').find('.js-images-selector.active').index();
        var imageUrl = getProjectImage(currentProject, image.data('imageType'), 'big', index);
        preloadImages([imageUrl], function() {
            hidePreloader(pagePreloader);
            showZoomImage(imageUrl);
        })


        function showZoomImage(imageUrl) {
            var imagesSelectors = image.parent().next();
            imagesSelectors.css({'z-index': 5});
            createZoomImage(imageUrl);
            $('body').css({'overflow': 'hidden'}).children('.wrapper').css({'overflow': 'scroll'});
            zoomContainer.show().animate({
                'opacity': 1
            }, zoomShowTime, function() {
                var deltaY = (zoomImage.children().height() - zoomImage.height()) / zoomImage.height();
                var deltaX = (zoomImage.children().width() -  zoomImage.width()) / zoomImage.width();
                var clientRect = zoomImage[0].getBoundingClientRect();
                var sct = (e.clientY - clientRect.top) * deltaY;
                var scl = (e.clientX - clientRect.left) * deltaX;
                zoomImage.scrollTop(sct);
                zoomImage.scrollLeft(scl);
                zoomImage.animate({
                    'opacity': 1
                }, zoomShowTime, function() {
                    zoomImage.data('showed', 'true');
                    // Перетаскивание зазумленной картинки
                    setMovingZoomImage(deltaX, deltaY, clientRect)
                    // Скрытие зазумленной картинки
                    projectWrapper.on('click', '.project_description_zoom_image', function() {
                        zoomImage.data('showed', 'false');
                        stopMovingZoomImage();
                        zoomContainer.stop(true,false).animate({
                            'opacity': 0
                        }, zoomShowTime, function() {
                            zoomContainer.hide();
                            zoomImage.css('opacity', 0).empty();
                            imagesSelectors.css({'z-index': ''});
                            $('body').css('overflow', '').children().css('overflow', '');
                        });
                    });
                });
            });
        }
    });

    // 
    // Ресайзы верхних картинок. Они заполняют всю свободную часть экрана по вертикали
    // 

    var projectContainer = $('.project_description_container');
    var smallImgages = $('.project_description_right_images_container');
    var scrollButton = $('.js-scroll-to-calculcate');

    function setProjectContainerHeight() {
        projectContainer.css('height', $(window).height()-$('.header').height());
        $('.project_description_images').css({'width': '100%', 'height': '100%'});
    }

    function setSmallImagesHeight() {
        smallImgages.css('height', 
            projectContainer.innerHeight() - 
            $('.project_description_special').outerHeight() - 
            parseInt(projectContainer.children('.project_description_left_column').css('borderTopWidth')));
    }

    function setScrollButtonPos() {
        var l = smallImgages.offset().left - parseInt(smallImgages.parent().css('borderLeftWidth'));
        scrollButton.css('left', l);
    }

    setProjectContainerHeight();
    setSmallImagesHeight();
    setScrollButtonPos();
    
    $(window).resize(function() {
        projectContainer = $('.project_description_container');
        smallImgages = $('.project_description_right_images_container');
        bodyWidth = $('body').width();
        setProjectContainerHeight();
        setSmallImagesHeight();
        setScrollButtonPos();
    });


    // Проскролл до калькулятора

    var buttonAnmTime = 500;

    if ($('html').scrollTop() > 100) {
        scrollButton.css('bottom', -300);
    };
    // фикс для вебкита, он почeму-то не хочет скроллить вверх без анимации
    $(window).load(function() {
        $('html, body').animate({'scrollTop': 0}, 100);
    })


    scrollButton.on('click', function() {
        $('html, body').animate(
            {'scrollTop': $('.js-calculate_container').position().top},
            700
        );
    });

    scrollButton.data('isAnimated', 'none');
    function showHideScrollButton() {
        if ($(document).scrollTop() > 100) {
            if (scrollButton.data('isAnimated') != 'down') {
                scrollButton.data('isAnimated', 'down');
                scrollButton.stop(true, false).animate(
                    {'bottom': -300},
                    buttonAnmTime,
                    function() {
                        scrollButton.data('isAnimated', 'none');
                        scrollButton.css('display', 'none');
                    }
                );
            }
        } else {
            if (scrollButton.data('isAnimated') != 'top') {
                scrollButton.data('isAnimated', 'top');
                scrollButton.stop(true, false).css('display', 'block').animate(
                    {'bottom': 0},
                    buttonAnmTime,
                    function() {
                        scrollButton.data('isAnimated', 'none');
                    }
                );
            }
        }
    }

    $(document).on('scroll', showHideScrollButton);




    // Выбор комплектации из предустановленных вариантов

    var bracketWidth = $('.js-price-preset-bracket').width();
    var bracketAnmTime = 700;
    // Расстояние между кнопками комплектаций
    var presetDist = 347;


    function setStartBracketBgPos(preset, bracket) {
        var i = preset.index() + 1;
        bracketWidth = $('.js-price-preset-bracket').width();
        var newBracketBgPos = -bracketWidth + presetDist * i;
        bracket.css({'backgroundPosition': newBracketBgPos});
    }

    function showStartPresetComplectation(preset, presetComplectations) {
        var i = preset.index();
        var newPos = presetComplectations.children().width() * i;
        presetComplectations.parent().scrollLeft(newPos);
    }


    function setComplectation(compClosest) {
        var startPreset = compClosest.find('.active.js-price-preset');
        var bracket = compClosest.find('.js-price-preset-bracket');
        var presetComplectations = compClosest.find('.js-preset-complectations');
        setStartBracketBgPos(startPreset, bracket);
        showStartPresetComplectation(startPreset, presetComplectations);
    }


    if (projectWrapper.data('calculatorType') == 'presets') {
        setComplectation(projectWrapper);
    }

    function setBracketBgPos(preset, bracket) {
        var i = preset.index() + 1;
        var newBracketBgPos = -bracketWidth + presetDist * i;
        bracket.stop(true, false).animate(
            {'backgroundPosition': newBracketBgPos},
            bracketAnmTime
        );
    }

    function showPresetComplectation(preset, presetComplectations) {
        var i = preset.index();
        var newPos = presetComplectations.children().width() * i;
        presetComplectations.parent().stop(true, false).animate({'scrollLeft': newPos}, bracketAnmTime);
    }


    projectWrapper.on('click', '.js-price-preset', function() {
        var this_ = $(this);
        this_.addClass('active').siblings().removeClass('active');
        setBracketBgPos(this_, this_.closest('.js-calculate_container').find('.js-price-preset-bracket'));
        showPresetComplectation(this_, this_.closest('.js-calculate_container').find('.js-preset-complectations'));
    });

    // Фикс белого блока с ценой и комплектацией в верху окна

    function fixPriceWrapper() {
        var anmFixTime = 700;
        $(window).scroll(function() {
            // Как их определить 1 раз?
            var priceWrapper = $('.project_calculate_info-wrapper');
            var priceWrapperParent = priceWrapper.parent();
            if ($(document).scrollTop() - priceWrapperParent.position().top > 0) {
                if (!priceWrapperParent.hasClass('with_fixed')) {
                    priceWrapperParent.css({
                        "marginTop": priceWrapper.outerHeight()
                    }).addClass('with_fixed');
                    priceWrapper.css('position', 'fixed').stop(true, false).animate({
                        'top': '-30px'
                    }, anmFixTime).children('.project_calculate_info-container').addClass('animated');
                }
               
            } else if ($(document).scrollTop() - priceWrapperParent.position().top < 0 ) {
                if (priceWrapperParent.hasClass('with_fixed')) {
                    priceWrapperParent.css({
                        "marginTop": 0
                    }).removeClass('with_fixed');
                    priceWrapper.css('position', '').stop(true, false).animate({
                        'top': '0px'
                    }, anmFixTime).children('.project_calculate_info-container').removeClass('animated');
                }
            }
        });
    }
    fixPriceWrapper();

    // Калькулятор домов

    projectWrapper.on('change', '.js-calc_input', function() {
        var input = $(this);
        var anmTime = 250;
        // подсчет новой цены
        var price = 0;
        var inputs = $('.js-calc_input:checked');
        inputs.each(function(i, e) {
            e = $(e);
            price += parseInt(e.val());
        });
        price = price * 1.2;
        var priceText = $('.js-price_value');
        // Замена стоимости комплекта
        var old_value = parseInt(priceText.data('priceValue'));
        var delta = price - old_value;
        if (delta) {
            var stepsCount = 20;
            var step = Math.round(delta / stepsCount);
            var interval = setInterval(function() {
                if (Math.abs(old_value - price) < Math.abs(step) * 2) {
                    clearInterval(interval);
                    priceText.text(separatePlaces(price, '.'));
                    priceText.data('priceValue', price);
                } else {
                    old_value += step;
                    priceText.text(separatePlaces(old_value, '.'));
                }
            }, 10);
        }

        var selectedItems = $('.project_calculate_selected_checkbox_text');
        // Показ соответствующей картинки
        if (input.attr('type') =='radio') {
            var i = input.closest('.radiobuttons_li').index();
            var imagesContainer = input.closest(
                    '.project_calculate_complectation_item'
                ).find('.project_calculator_icons_container');
            imagesContainer.stop(true, false).animate(
                {'scrollTop': (imagesContainer.height() + 71) * i},
                anmTime * 3,
                'easeInOutQuad'
            );
            // Замена текста под ценой
            var input_tupe = input.data('type');
            selectedItems.each(function(i, e) {
                e = $(e);
                if (e.data('type') == input_tupe) {
                    e.text(input.data('text'));
                }
            });
        }
    });
});


$(window).load(function() {
    
    // setCursor($('.project_description_image-item'));
})
