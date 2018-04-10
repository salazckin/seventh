function is_animated (collection) {
	if (collection.data('_jqueryAnimateSeq')) {
		return true;
	} else {
		return false;
	}
}

var images = [
	'/static/images/elite_house_sprite.png',
	'/static/images/shaped_beam_house_sprite.png',
	'/static/images/beam_house_sprite.png',
	'/static/images/panel_frame_house_sprite.png'
]

$(document).ready(function() {
	// Прелоадер

	var preloaderAnmSettigngs = {
		'startSlide': 0,
		'slidesCount': 29,
		'slideSize': 301,
		'slideDuration': 45,
		// 'slideDuration': 75,
		'cycleTimes': 1,
		'reverse': false,
		'spriteSrc': '/static/images/preloader_index_1.png'
	}
	var preloader = $('.js-preloader-sprite');
	// var preloaderImage = '/static/images/beam_house_sprite.png';

	function startPreloader() {
		preloader.css({
			'backgroundImage': preloaderAnmSettigngs.spriteSrc,
			'opacity': 0
		}).animate({
			'opacity': 1
		}, 300).animateSeq(preloaderAnmSettigngs);
	}


	preloader.on('end.animateseq', function(ev) {
		// preloaderAnmSettigngs.reverse = !preloaderAnmSettigngs.reverse;
		// preloaderAnmSettigngs.startSlide = 29;
		preloader.animateSeq(preloaderAnmSettigngs);
	});

	// startPreloader();
	preloadImages([preloaderAnmSettigngs.spriteSrc], startPreloader);

	$(window).load(function() {
		setTimeout(function() {
			var preloaderParent = preloader.parent();
			preloaderParent.animate({
				'opacity': 0
			}, 500, function() {
				preloader.remove();
				preloaderParent.remove();
				$('.js-loaded_index_wrapper').animate({'opacity': 1}, 500);
			});
		}, 100);
	});


	// $('.index_wrapper').css('opacity', 0)

	// preloadImages(images, function() {
	// 	$('.house_type_image.elite').css('backgroundImage', 'url("' + images[0] + '")');
	// 	$('.house_type_image.shaped-beam').css('backgroundImage', 'url("' + images[1] + '")');
	// 	$('.house_type_image.beam').css('backgroundImage', 'url("' + images[2] + '")');
	// 	$('.house_type_image.panel-frame').css('backgroundImage', 'url("' + images[3] + '")');
	// 	$('.index_house_type_image-container').css({
	// 		// 'visibility': 'visible',
	// 		'opacity': 0
	// 	}).animate(
	// 		{'opacity': 1},
	// 		1200
	// 	);
	// });

	var animate_settings = {
		// 'slidesCount': 18,
		'slidesCount': 14,
		// 'slideSize': 441,
		'slideSize': 447,
		'slideDuration': 35,
		// 'slideDuration': 100,
		'cycleTimes': 1
	};
	// var houseAnimationTimeout = 250;
	var houseAnimationTimeout = 0;

	$('.js_animated_elem').each(function(i, elem) {
		var elem = $(elem);
		var hoveredParent = elem.closest('.js_sprite_animated');
		elem.on('step.animateseq', function(ev) {
			// hoveredParent.data('animateStep', ev.stepNum);
			hoveredParent.data('animateSlide', ev.currSlide);
		});
		elem.on('end.animateseq', function(ev) {
			hoveredParent.data('animateState', 'end_aniamate');
		});
	});


function enterOnHouse(this_, startSlide, animated_elem) {
	if (this_.data('animateState') == 'animated_backward') {
		animated_elem.animateSeq('stop');
	}
	this_.data('animateState', 'animated_forward')

	if (this_.data('animateSlide')) {
		if (this_.data('animateSlide') == animate_settings.slidesCount -1) {
			startSlide = 0;
		} else {
			startSlide = this_.data('animateSlide');
		}
	}

	// Прячем тень под домом
	this_.find('.house_type_shadow').stop().animate(
		{'opacity': 0},
		animate_settings.slidesCount * animate_settings.slideDuration
	);

	animated_elem.animateSeq($.extend({}, animate_settings, {
		'startSlide': startSlide,
	}));
}

function leaveFromHouse( this_, startSlide, animated_elem) {
	if (this_.data('animateState') == 'animated_forward') {
		animated_elem.animateSeq('stop');
	}
	this_.data('animateState', 'animated_backward');

	if (this_.data('animateSlide')) {
		if (this_.data('animateSlide') == 0) {
			startSlide = animate_settings.slidesCount -1;
		} else {
			startSlide = this_.data('animateSlide');
		}
	}

	// Показываем тень под домом
	this_.find('.house_type_shadow').stop().animate(
		{'opacity': 1},
		animate_settings.slidesCount * animate_settings.slideDuration,
		'easeInQuint'
	);

	animated_elem.animateSeq($.extend({}, animate_settings, {
		'reverse': true,
		'startSlide': startSlide,
	}));
}

function onEnter(ev) {
	var this_ = $(this).closest('.js_sprite_animated'),
		startSlide = 0,
		animated_elem = $('.js_animated_elem', this_);
	// меняем фон у цифр
	this_.find('.index_house_type-name_link').addClass('hovered');

	if (this_.data('leaveTimer')) {
		clearTimeout(this_.data('leaveTimer'));
	}
	var timerID = setTimeout(function() {
		if (this_.data('mouseEvent') != 'longEnter') {
			enterOnHouse(this_, startSlide, animated_elem);
			this_.data('mouseEvent', 'longEnter');
		}
	}, houseAnimationTimeout);
	this_.data('enterTimer', timerID);
};

function onLeave(ev) {
	var this_ = $(this).closest('.js_sprite_animated'),
		startSlide = 0,
		animated_elem = $('.js_animated_elem', this_);

	// меняем фон у цифр
	this_.find('.index_house_type-name_link').removeClass('hovered');

	clearTimeout(this_.data('enterTimer'));
	var timerID = setTimeout(function() {
		if (this_.data('mouseEvent') == 'longEnter') {
			leaveFromHouse(this_, startSlide, animated_elem);
			this_.data('mouseEvent', 'longLeave');
		}
	}, houseAnimationTimeout);
	this_.data('leaveTimer', timerID);
};


	$('.js_sprite_hovered_link').on('mouseenter', onEnter);
	$('.js_sprite_hovered_link').on('mouseleave', onLeave);


	// Перелкючалка спецпредложений 
	$('.index_special_items_switcher_button').on('click', function() {
		var this_ = $(this);
		var imageList = $('.index_special_images');
		var textList = $('.index_special_texts')
		var animate_duration = 1000

		this_.addClass('active').siblings().removeClass('active');
		index = $('.index_special_items_switcher_button').index(this_);
		
		imageList.children().each(function(i, elem) {
			if (i == index) {
				imageList.parent().scrollLeft = imageList.children().width() * i;
				imageList.parent().stop().animate(
					{'scrollLeft': imageList.children().width() * i},
					animate_duration
					// 'easeInOutCubic'
				);
			}
		});

		textList.children().each(function(i, elem) {
			var elem = $(elem);
			if (i == index && !elem.hasClass('showed') ) {
				textList.stop().animate(
					{
						'left': 150,
						'opacity': 0
					},
					animate_duration/2,
					'easeInSine',
					function() {
						elem.addClass('showed').siblings().removeClass('showed');
						textList.stop().animate(
							{
								'left':0,
								'opacity': 1
							},
							animate_duration/2,
							'easeOutQuart'
						);
					}
				);
			}
		});
	});

	// Анимация платформ с домами
	var platforms = $('.index_house_band_items');
	var platformsBand = new PlatformsBand(platforms);
	var platformsStopDelay;

	platformsBand.initMoving();


	platforms.on('mouseenter', '.catalogue_project_image_link', function() {
		if (!platformsBand.moved) {
			clearTimeout(platformsStopDelay);
			platformsBand.hovered = true;
		}
	});

	platforms.on('mouseleave', '.catalogue_project_image_link', function() {
		platformsStopDelay = setTimeout(function() {
			platformsBand.hovered = false;
		}, 500);
	});

	$(window).resize(function() {
		platformsBand.pause();
		platformsBand.initMoving();
	})


	// Наведение на элемент ленты

	platforms.on('mouseenter', '.catalogue_project_image_link', function() {
		var this_ = $(this);
		var elem = this_.closest('.catalogue_project');
		var hovered_elements = elem.find('.js-hover-animated');
		hovered_elements.each(function(i, e) {
			e = $(e);
			e.data('startMargin', e.css('marginTop'));
		})
			// .add(elem.find('.catalogue_project_hover_bg'));
		hovered_elements.show().stop(true, false).animate(
			{
				'opacity': 1,
				'marginTop': 0
			},
			350
		)
	});

	platforms.on('mouseleave', '.catalogue_project_image_link', function() {
		var this_ = $(this);
		var elem = this_.closest('.catalogue_project');
		var hovered_elements = elem.find('.js-hover-animated');

		hovered_elements.each(function(i, e) {
			e = $(e);
			e.stop(true, false).animate(
				{
					'opacity': 0,
					'marginTop': e.data('startMargin')
				},
				350,
				function() {
					e.hide();
				}
			);
		});
	});


	// ховер на спецпредложения
	var specialContainer = $('.index_container_special_right');

	specialContainer.on('mouseenter', 'a', function () {
		specialContainer.find('.index_container_special_right_ribbon').animate(
			{'top': '-60px'},
			400
		);
		specialContainer.find('.index_special_image_arrow').animate(
			{'left': '267px'},
			400
		);
	});

	specialContainer.on('mouseleave', 'a', function () {
		specialContainer.find('.index_container_special_right_ribbon').stop(true, false).animate(
			{'top': '-30px'},
			400
		);
		specialContainer.find('.index_special_image_arrow').stop(true, false).animate(
			{'left': '283px'},
			400
		);
	});
});
